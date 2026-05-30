package com.roadwatch.backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
    private final CloudinaryService cloudinaryService;

    public ImageStorageService(
            @Value("${roadwatch.uploads.dir}") String uploadsDir,
            @Value("${roadwatch.public-base-url}") String publicBaseUrl,
            @Autowired CloudinaryService cloudinaryService) throws IOException {
        this.uploadDir = Paths.get(uploadsDir).toAbsolutePath().normalize();
        this.cloudinaryService = cloudinaryService;
        Files.createDirectories(this.uploadDir);
    }

    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = ".jpg";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase();
            if (!ext.matches("\\.(jpg|jpeg|png|webp)")) ext = ".jpg";
        }
        String filename = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        try {
            String url = cloudinaryService.uploadImage(target.toFile());
            logger.info("Cloudinary upload success: {}", url);
            return url;
        } catch (Exception e) {
            logger.warn("Cloudinary upload failed: {}", e.getMessage());
            return "http://13.55.212.9:8080/api/images/" + filename;
        }
    }

    public Path resolve(String filename) {
        Path resolved = uploadDir.resolve(filename).normalize();
        if (!resolved.startsWith(uploadDir)) throw new IllegalArgumentException("Invalid filename");
        return resolved;
    }

    public Path getUploadDir() { return uploadDir; }
}
