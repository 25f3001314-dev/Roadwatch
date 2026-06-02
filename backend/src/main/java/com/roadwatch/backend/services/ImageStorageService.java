package com.roadwatch.backend.services;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {
    private static final Logger logger = LoggerFactory.getLogger(ImageStorageService.class);

    private final Path uploadDir;
    private final String publicBaseUrlFallback;

    public ImageStorageService(
            @Value("${roadwatch.uploads.dir}") String uploadsDir,
            @Value("${roadwatch.public-base-url}") String publicBaseUrl) throws IOException {
        this.uploadDir = Paths.get(uploadsDir).toAbsolutePath().normalize();
        this.publicBaseUrlFallback = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
        Files.createDirectories(this.uploadDir);
    }

    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = ".jpg";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase();
            if (!ext.matches("\\.(jpg|jpeg|png|webp)")) {
                ext = ".jpg";
            }
        }
        String filename = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        
        // Dynamically construct URL using current request to ensure correct scheme (HTTP/HTTPS) and host
        String imageUrl = constructImageUrl(filename);
        logger.debug("Stored image: {} at URL: {}", filename, imageUrl);
        return imageUrl;
    }

    /**
     * Constructs the image URL using the current request context to ensure
     * correct scheme (HTTP/HTTPS) and host, preventing Mixed Content errors on production.
     */
    private String constructImageUrl(String filename) {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                if (request != null) {
                    String scheme = request.getScheme();
                    String serverName = request.getServerName();
                    int serverPort = request.getServerPort();
                    String contextPath = request.getContextPath();
                    
                    // Reconstruct base URL from request
                    String baseUrl = scheme + "://" + serverName;
                    if (("http".equals(scheme) && serverPort != 80) || 
                        ("https".equals(scheme) && serverPort != 443)) {
                        baseUrl += ":" + serverPort;
                    }
                    String fullUrl = baseUrl + contextPath + "/api/images/" + filename;
                    logger.debug("Constructed image URL from request: {} (scheme={})", fullUrl, scheme);
                    return fullUrl;
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to construct URL from request context: {}", e.getMessage());
        }
        
        // Fallback to configured base URL if request context not available
        String fallbackUrl = publicBaseUrlFallback + "/api/images/" + filename;
        logger.debug("Using fallback image URL: {}", fallbackUrl);
        return fallbackUrl;
    }

    public Path resolve(String filename) {
        Path resolved = uploadDir.resolve(filename).normalize();
        if (!resolved.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid filename");
        }
        return resolved;
    }

    public Path getUploadDir() {
        return uploadDir;
    }
}
