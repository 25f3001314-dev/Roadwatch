package com.roadwatch.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

/**
 * Initializes Firebase Admin SDK from the FIREBASE_CREDENTIALS env var.
 * If not set, FCM push notifications are disabled (graceful degradation).
 * The notification inbox still works — just no push delivery.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized");
            return;
        }

        String credentials = System.getenv("FIREBASE_CREDENTIALS");
        if (credentials == null || credentials.isBlank()) {
            log.warn("FIREBASE_CREDENTIALS env var not set. Push notifications will be disabled. "
                    + "Set it to the Firebase service account JSON content for production.");
            return;
        }

        try {
            GoogleCredentials creds = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentials.getBytes(StandardCharsets.UTF_8)));
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(creds)
                    .build();
            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Firebase: {}. Push notifications disabled.", e.getMessage());
        }
    }
}
