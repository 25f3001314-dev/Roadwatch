package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Public citizen-facing endpoints (no auth required).
 * Used by the Android app for complaint tracking and feedback.
 */
@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    @Autowired
    private ComplaintRepository complaintRepository;

    /**
     * Get all complaints submitted by a citizen (identified by phone/contact).
     */
    @GetMapping("/my-complaints")
    public List<Complaint> myComplaints(@RequestParam String phone) {
        if (phone == null || phone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
        }
        return complaintRepository.findByReporterContactOrderByTimestampDesc(phone.trim());
    }

    /**
     * Submit feedback/rating for a resolved complaint.
     */
    @PostMapping("/complaints/{id}/feedback")
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        // Store feedback in adminNotes (appended) since we don't have a separate feedback table
        String rating = String.valueOf(body.getOrDefault("rating", ""));
        String comment = String.valueOf(body.getOrDefault("comment", ""));
        String feedback = "\n[CITIZEN FEEDBACK] Rating: " + rating + "/5" +
                (comment.isBlank() ? "" : " | " + comment);

        String existing = complaint.getAdminNotes() != null ? complaint.getAdminNotes() : "";
        complaint.setAdminNotes(existing + feedback);
        complaintRepository.save(complaint);

        return ResponseEntity.ok(Map.of("success", true, "message", "Feedback recorded"));
    }

    /**
     * Register a device token for push notifications.
     * In production this would store in a device_tokens table.
     * For now, logs the registration (placeholder for FCM integration).
     */
    @PostMapping("/device-token")
    public ResponseEntity<Map<String, Object>> registerDeviceToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String phone = body.get("phone");
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is required");
        }
        // TODO: Store in device_tokens table when FCM is fully integrated
        // For now, acknowledge the registration
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Device token registered",
                "note", "Push notifications will be enabled when FCM is configured"
        ));
    }
}
