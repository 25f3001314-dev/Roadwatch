package com.roadwatch.backend.services;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.DeviceToken;
import com.roadwatch.backend.models.Notification;
import com.roadwatch.backend.repositories.DeviceTokenRepository;
import com.roadwatch.backend.repositories.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Sends push notifications to citizens when their complaint status changes.
 *
 * Flow:
 *   1. ComplaintService.updateComplaint() calls onStatusChange()
 *   2. We build a notification title + body from the new status
 *   3. Save to `notifications` table (persistent inbox)
 *   4. Fetch all active FCM tokens for the complaint owner
 *   5. Send via Firebase Cloud Messaging
 *
 * Gracefully degrades if Firebase is not configured (logs warning, doesn't crash).
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepo;
    private final DeviceTokenRepository deviceTokenRepo;

    public NotificationService(NotificationRepository notificationRepo,
                               DeviceTokenRepository deviceTokenRepo) {
        this.notificationRepo = notificationRepo;
        this.deviceTokenRepo = deviceTokenRepo;
    }

    /**
     * Called after a complaint status change. Sends push + persists notification.
     *
     * @param complaint  the updated complaint (already saved to DB)
     * @param oldStatus  previous status before the change
     * @param newStatus  new status after the change
     */
    public void onStatusChange(Complaint complaint, String oldStatus, String newStatus) {
        Long userId = complaint.getUserId();
        if (userId == null) {
            log.debug("Complaint {} has no user_id — skipping notification", complaint.getId());
            return;
        }

        String title = buildTitle(newStatus);
        String body = buildBody(complaint, newStatus);
        String category = newStatus;

        // 1. Persist to notification inbox
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setComplaintId(complaint.getId());
        notif.setTitle(title);
        notif.setBody(body);
        notif.setCategory(category);
        notificationRepo.save(notif);

        // 2. Send FCM push to all active devices
        List<DeviceToken> tokens = deviceTokenRepo.findByUser_IdAndActiveTrue(userId);
        if (tokens.isEmpty()) {
            log.debug("No active FCM tokens for userId={}", userId);
            return;
        }

        for (DeviceToken dt : tokens) {
            try {
                sendFcm(dt.getFcmToken(), title, body, Map.of(
                        "type", "STATUS_CHANGE",
                        "complaintId", String.valueOf(complaint.getId()),
                        "newStatus", newStatus,
                        "department", complaint.getDepartment() != null ? complaint.getDepartment() : ""
                ));
                notif.setFcmSent(true);
            } catch (Exception e) {
                log.warn("FCM send failed for token {}: {}", dt.getFcmToken(), e.getMessage());
                // Mark stale tokens inactive
                if (isTokenInvalid(e)) {
                    dt.setActive(false);
                    deviceTokenRepo.save(dt);
                }
            }
        }
        notificationRepo.save(notif);
    }

    private void sendFcm(String token, String title, String body, Map<String, String> data) throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("Firebase not initialized — skipping FCM send. Set FIREBASE_CREDENTIALS env var.");
            return;
        }

        Message message = Message.builder()
                .setToken(token)
                .setNotification(com.google.firebase.messaging.Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putAllData(data)
                .build();

        String messageId = FirebaseMessaging.getInstance().send(message);
        log.info("FCM sent messageId={} to token={}...", messageId, token.substring(0, 8));
    }

    private String buildTitle(String status) {
        return switch (status) {
            case "ASSIGNED" -> "Complaint assigned";
            case "IN_PROGRESS" -> "Repair work started";
            case "RESOLVED" -> "Issue resolved ✓";
            case "REJECTED" -> "Update on your report";
            default -> "Complaint update";
        };
    }

    private String buildBody(Complaint complaint, String status) {
        String id = "#" + complaint.getId();
        String dept = complaint.getDepartment() != null ? complaint.getDepartment() : "the concerned authority";
        return switch (status) {
            case "ASSIGNED" -> "Your complaint " + id + " has been assigned to " + dept + ".";
            case "IN_PROGRESS" -> "Repair work has started on your reported road defect " + id + ".";
            case "RESOLVED" -> "Your complaint " + id + " has been resolved. Tap to see the repair.";
            case "REJECTED" -> "Your complaint " + id + " could not be verified. Tap for details.";
            default -> "Your complaint " + id + " status changed to " + status + ".";
        };
    }

    private boolean isTokenInvalid(Exception e) {
        String msg = e.getMessage();
        return msg != null && (msg.contains("not-registered") || msg.contains("invalid-registration"));
    }
}
