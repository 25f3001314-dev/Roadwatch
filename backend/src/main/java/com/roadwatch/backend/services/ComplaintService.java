package com.roadwatch.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import com.roadwatch.backend.dto.ComplaintStatsDto;
import com.roadwatch.backend.dto.ComplaintUpdateRequest;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class ComplaintService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"
    );

    private static final Set<String> VALID_SEVERITIES = Set.of("HIGH", "MEDIUM", "LOW");

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AiServiceClient aiServiceClient;

    @Autowired
    private DecisionEngineService decisionEngineService;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${roadwatch.ai.optional:false}")
    private boolean aiOptional;

    public Complaint createComplaint(Complaint complaint, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }

        try {
            String imageUrl = imageStorageService.store(image);
            complaint.setImageUrl(imageUrl);

            AiAnalysisResponseDto aiResponse = null;
            try {
                aiResponse = aiServiceClient.analyzeImage(image, "/analyze_surface");
            } catch (Exception aiEx) {
                if (!aiOptional) {
                    throw aiEx;
                }
            }
            decisionEngineService.assignSeverityAndDepartment(complaint, aiResponse);

            if (aiResponse != null && aiResponse.getDetections() != null) {
                complaint.setAiDetectionsJson(objectMapper.writeValueAsString(aiResponse.getDetections()));
            }

            complaint.setStatus("PENDING");
            complaint.setTimestamp(LocalDateTime.now());

            return complaintRepository.save(complaint);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to process complaint: " + e.getMessage(),
                    e
            );
        }
    }

    public Page<Complaint> findComplaints(
            String status,
            String severity,
            String department,
            String roadType,
            Pageable pageable
    ) {
        Specification<Complaint> spec = Specification.where(null);

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, q, cb) ->
                    cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
        }
        if (severity != null && !severity.isBlank()) {
            spec = spec.and((root, q, cb) ->
                    cb.equal(cb.upper(root.get("severity")), severity.trim().toUpperCase()));
        }
        if (department != null && !department.isBlank()) {
            spec = spec.and((root, q, cb) ->
                    cb.like(cb.lower(root.get("department")), "%" + department.trim().toLowerCase() + "%"));
        }
        if (roadType != null && !roadType.isBlank()) {
            spec = spec.and((root, q, cb) ->
                    cb.equal(cb.upper(root.get("roadType")), roadType.trim().toUpperCase()));
        }

        return complaintRepository.findAll(spec, pageable);
    }

    public Complaint getById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    public Complaint updateComplaint(Long id, ComplaintUpdateRequest request) {
        Complaint complaint = getById(id);

        if (request.getStatus() != null) {
            String status = request.getStatus().trim().toUpperCase();
            if (!VALID_STATUSES.contains(status)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid status. Allowed: " + VALID_STATUSES
                );
            }
            complaint.setStatus(status);
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            complaint.setDepartment(request.getDepartment().trim());
        }

        if (request.getSeverity() != null && !request.getSeverity().isBlank()) {
            String severity = request.getSeverity().trim().toUpperCase();
            if (!VALID_SEVERITIES.contains(severity)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid severity");
            }
            complaint.setSeverity(severity);
        }

        if (request.getAdminNotes() != null) {
            complaint.setAdminNotes(request.getAdminNotes());
        }

        return complaintRepository.save(complaint);
    }

    public ComplaintStatsDto getStats() {
        List<Complaint> all = complaintRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long assigned = all.stream().filter(c -> "ASSIGNED".equalsIgnoreCase(c.getStatus())).count();
        long inProgress = all.stream().filter(c -> "IN_PROGRESS".equalsIgnoreCase(c.getStatus())).count();
        long resolved = all.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
        long highSeverity = all.stream().filter(c -> "HIGH".equalsIgnoreCase(c.getSeverity())).count();

        return new ComplaintStatsDto(total, pending, assigned, inProgress, resolved, highSeverity);
    }

    public List<Complaint> getAllForMap() {
        return complaintRepository.findAll();
    }
}
