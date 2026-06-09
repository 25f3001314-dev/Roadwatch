package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.ComplaintStatusHistory;
import com.roadwatch.backend.models.Notification;
import com.roadwatch.backend.repositories.ComplaintRepository;
import com.roadwatch.backend.repositories.NotificationRepository;
import com.roadwatch.backend.repositories.StatusHistoryRepository;
import com.roadwatch.backend.services.JwtService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Citizen-facing endpoints for complaint tracking + notifications.
 * All require a valid citizen JWT (subject = "citizen:{id}").
 *
 * These are ADDITIVE — they don't touch the admin PATCH flow at all.
 */
@RestController
@RequestMapping("/api/citizen")
public class CitizenComplaintController {

    private final ComplaintRepository complaintRepo;
    private final StatusHistoryRepository historyRepo;
    private final NotificationRepository notifRepo;
    private final JwtService jwtService;

    public CitizenComplaintController(ComplaintRepository complaintRepo,
                                      StatusHistoryRepository historyRepo,
                                      NotificationRepository notifRepo,
                                      JwtService jwtService) {
        this.complaintRepo = complaintRepo;
        this.historyRepo = historyRepo;
        this.notifRepo = notifRepo;
        this.jwtService = jwtService;
    }

    /**
     * GET /api/citizen/me/complaints — citizen's own complaints, newest first.
     */
    @GetMapping("/me/complaints")
    public ResponseEntity<?> myComplaints(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        Specification<Complaint> spec = (root, q, cb) -> cb.equal(root.get("userId"), userId);
        Page<Complaint> result = complaintRepo.findAll(spec,
                PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/citizen/me/complaints/{id}/timeline — full status history for one complaint.
     */
    @GetMapping("/me/complaints/{id}/timeline")
    public ResponseEntity<?> complaintTimeline(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {

        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        // Verify ownership
        Complaint complaint = complaintRepo.findById(id).orElse(null);
        if (complaint == null || !userId.equals(complaint.getUserId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Complaint not found"));
        }

        List<ComplaintStatusHistory> history = historyRepo.findByComplaintIdOrderByChangedAtAsc(id);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/citizen/me/notifications — notification inbox, newest first.
     */
    @GetMapping("/me/notifications")
    public ResponseEntity<?> myNotifications(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        Page<Notification> result = notifRepo.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/citizen/me/notifications/unread-count
     */
    @GetMapping("/me/notifications/unread-count")
    public ResponseEntity<?> unreadCount(@RequestHeader("Authorization") String auth) {
        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        return ResponseEntity.ok(Map.of("count", notifRepo.countUnreadByUserId(userId)));
    }

    /**
     * POST /api/citizen/me/notifications/mark-read — mark all as read.
     */
    @Transactional
    @PostMapping("/me/notifications/mark-read")
    public ResponseEntity<?> markAllRead(@RequestHeader("Authorization") String auth) {
        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        notifRepo.markAllReadForUser(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * POST /api/citizen/me/complaints/{id}/feedback — citizen rates resolution.
     */
    @PostMapping("/me/complaints/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Long userId = extractCitizenId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));

        Complaint complaint = complaintRepo.findById(id).orElse(null);
        if (complaint == null || !userId.equals(complaint.getUserId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Complaint not found"));
        }

        Object ratingObj = body.get("rating");
        if (ratingObj instanceof Number) {
            int rating = ((Number) ratingObj).intValue();
            if (rating >= 1 && rating <= 5) {
                complaint.setCitizenRating(rating);
                complaintRepo.save(complaint);
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    private Long extractCitizenId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String token = authHeader.substring(7);
            if (!jwtService.isValid(token)) return null;
            String subject = jwtService.extractUsername(token);
            if (subject != null && subject.startsWith("citizen:")) {
                return Long.parseLong(subject.substring(8));
            }
        } catch (Exception ignored) {}
        return null;
    }
}
