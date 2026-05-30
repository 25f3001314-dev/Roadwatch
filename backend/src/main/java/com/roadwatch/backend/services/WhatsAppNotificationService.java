package com.roadwatch.backend.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppNotificationService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppNotificationService.class);
    private static final String FROM = "whatsapp:+14155238886";

    private final boolean enabled;

    public WhatsAppNotificationService() {
        String sid = System.getenv("TWILIO_ACCOUNT_SID");
        String token = System.getenv("TWILIO_AUTH_TOKEN");
        if (sid != null && !sid.isBlank() && token != null && !token.isBlank()) {
            Twilio.init(sid, token);
            this.enabled = true;
            log.info("WhatsApp notification service initialized");
        } else {
            this.enabled = false;
            log.warn("WhatsApp notification service disabled: missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
        }
    }

    /**
     * Send a WhatsApp notification to a citizen when their complaint is resolved.
     */
    public void notifyComplaintResolved(String reporterPhone, Long complaintId, String department) {
        if (!enabled) {
            log.debug("WhatsApp notification skipped: service disabled");
            return;
        }

        if (reporterPhone == null || reporterPhone.isBlank()) {
            log.warn("Cannot send WhatsApp notification: reporter phone is null or empty");
            return;
        }

        try {
            // Ensure phone number is in international format
            String phoneNumber = formatPhoneNumber(reporterPhone);
            String toNumber = "whatsapp:" + phoneNumber;

            String messageBody = String.format(
                    "Hi! Your road complaint #%d has been resolved by %s. " +
                    "Thank you for reporting and helping us maintain better roads!",
                    complaintId, department
            );

            Message message = Message.creator(
                    new PhoneNumber(toNumber),      // To number (WhatsApp)
                    new PhoneNumber(FROM),          // From number (our Twilio WhatsApp)
                    messageBody                     // Message text
            ).create();

            log.info("WhatsApp notification sent. SID: {}, To: {}, Complaint: {}", 
                    message.getSid(), toNumber, complaintId);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp notification for complaint {}: {}", 
                    complaintId, e.getMessage(), e);
        }
    }

    /**
     * Format phone number to international format (+country code format).
     * Assumes Indian numbers if no country code is provided.
     */
    private String formatPhoneNumber(String phone) {
        String clean = phone.replaceAll("[^0-9+]", "");
        
        // If already has +, return as-is
        if (clean.startsWith("+")) {
            return clean;
        }
        
        // If 10 digits (Indian), prepend +91
        if (clean.length() == 10) {
            return "+91" + clean;
        }
        
        // If already has country code but no +, add it
        if (clean.length() > 10) {
            return "+" + clean;
        }
        
        // Fallback: assume it's Indian
        return "+91" + clean;
    }
}
