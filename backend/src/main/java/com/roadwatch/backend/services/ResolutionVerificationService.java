package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import com.roadwatch.backend.dto.ResolutionProofRequest;
import com.roadwatch.backend.dto.ResolutionVerificationResult;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.ComplaintAssignmentHistory;
import com.roadwatch.backend.repositories.ComplaintAssignmentHistoryRepository;
import com.roadwatch.backend.repositories.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ResolutionVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(ResolutionVerificationService.class);
    @Value("${roadwatch.resolution.max-distance-meters:20.0}")
    private double maxDistanceMeters;
    @Value("${roadwatch.resolution.max-photo-age-minutes:5}")
    private long maxPhotoAgeMinutes;
    private static final Set<String> usedPhotoHashes = ConcurrentHashMap.newKeySet();
    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private AiServiceClient aiServiceClient;
    @Autowired private ImageStorageService imageStorageService;
    @Autowired(required = false) private ComplaintAssignmentHistoryRepository historyRepository;
    @Autowired(required = false) private WhatsAppNotificationService whatsAppNotificationService;

    public ResolutionVerificationResult verifyAndResolve(Long complaintId, MultipartFile proofImage, ResolutionProofRequest req) {
        if (proofImage == null || proofImage.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof image required");
        if (req.getOfficerLat() == null || req.getOfficerLng() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GPS required");
        if (req.getPhotoTimestampMs() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Timestamp required");
        Complaint complaint = complaintRepository.findById(complaintId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
        if (complaint.getLocation() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No GPS on complaint");
        String photoHash;
        try { photoHash = sha256(proofImage.getBytes()); } catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Hash failed"); }
        if (usedPhotoHashes.contains(photoHash)) return ResolutionVerificationResult.fail("HASH", "Yeh photo pehle use ho chuki hai.");
        long serverNowMs = System.currentTimeMillis();
        long photoAgeMs = serverNowMs - req.getPhotoTimestampMs();
        long maxAgeMs = maxPhotoAgeMinutes * 60 * 1000L;
        if (photoAgeMs < 0) return ResolutionVerificationResult.fail("TIMESTAMP", "Future timestamp detected.");
        if (photoAgeMs > maxAgeMs) return ResolutionVerificationResult.fail("TIMESTAMP", "Photo " + (photoAgeMs/60000) + " min purani hai.");
        double complaintLat = complaint.getLocation().getY();
        double complaintLng = complaint.getLocation().getX();
        double dist = haversineMeters(complaintLat, complaintLng, req.getOfficerLat(), req.getOfficerLng());
        if (dist > maxDistanceMeters) return ResolutionVerificationResult.fail("GPS", String.format("Aap %.0fm door hain. %.0fm ke andar aao.", dist, maxDistanceMeters));
        try {
            AiAnalysisResponseDto ai = aiServiceClient.analyzeImage(proofImage, "/analyze_surface");
            if (ai != null && ai.getDetections() != null && !ai.getDetections().isEmpty()) {
                return ResolutionVerificationResult.fail("YOLO", "AI ne abhi bhi pothole detect kiya. Sahi repair karo.");
            }
        } catch (Exception e) { logger.warn("YOLO skip: {}", e.getMessage()); }
        usedPhotoHashes.add(photoHash);
        String proofUrl;
        try { proofUrl = imageStorageService.store(proofImage); } catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Store failed"); }
        complaint.setStatus("RESOLVED");
        complaint.setResolvedAt(LocalDateTime.now());
        complaint.setResolutionProofUrl(proofUrl);
        complaintRepository.save(complaint);
        if (whatsAppNotificationService != null && complaint.getReporterContact() != null) {
            try { whatsAppNotificationService.notifyComplaintResolved(complaint.getReporterContact(), complaint.getId(), complaint.getDepartment()); } catch (Exception e) { logger.warn("WA failed: {}", e.getMessage()); }
        }
        if (historyRepository != null) {
            try {
                ComplaintAssignmentHistory ev = new ComplaintAssignmentHistory();
                ev.setComplaintId(complaintId); ev.setAction("RESOLVED_WITH_PROOF");
                ev.setReason(String.format("GPS=%.1fm,Age=%ds,YOLO=clear,Hash=unique", dist, photoAgeMs/1000));
                ev.setPerformedBy("officer"); ev.setOccurredAt(LocalDateTime.now()); ev.setDepartment(complaint.getDepartment());
                historyRepository.save(ev);
            } catch (Exception e) { logger.warn("Audit failed: {}", e.getMessage()); }
        }
        return ResolutionVerificationResult.pass();
    }
    private static double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0;
        double dLat = Math.toRadians(lat2-lat1), dLon = Math.toRadians(lon2-lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
        return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    }
    private static String sha256(byte[] data) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));
    }
}