package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;

@Service
public class AiServiceClient {
    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiAnalysisResponseDto analyzeImage(MultipartFile file, String endpoint) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        byte[] bytes = file.getBytes();
        ByteArrayResource fileAsResource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        };

        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("image", fileAsResource)
                .header("Content-Disposition", "form-data; name=\"image\"; filename=\"" + fileAsResource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM);

        MultiValueMap<String, HttpEntity<?>> body = bodyBuilder.build();
        HttpEntity<MultiValueMap<String, HttpEntity<?>>> requestEntity = new HttpEntity<>(body, headers);
        String url = aiServiceUrl + endpoint;

        try {
            ResponseEntity<AiAnalysisResponseDto> response = restTemplate.postForEntity(
                    url, requestEntity, AiAnalysisResponseDto.class);
            AiAnalysisResponseDto result = response.getBody();
            if (result == null) {
                return emptyFailure();
            }
            return result;
        } catch (RestClientException e) {
            logger.error("🚨 YOLO AI Service fails to connect at URL: {}. Error: {}", aiServiceUrl, e.getMessage());
            return emptyFailure();
        }
    }

    public AiAnalysisResponseDto analyzeImage(Path filePath, String endpoint) throws Exception {
        byte[] bytes = Files.readAllBytes(filePath);
        String filename = filePath.getFileName().toString();
        return analyzeImage(bytes, filename, endpoint);
    }

    private AiAnalysisResponseDto analyzeImage(byte[] bytes, String filename, String endpoint) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        ByteArrayResource fileAsResource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("image", fileAsResource)
                .header("Content-Disposition", "form-data; name=\"image\"; filename=\"" + fileAsResource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM);

        MultiValueMap<String, HttpEntity<?>> body = bodyBuilder.build();
        HttpEntity<MultiValueMap<String, HttpEntity<?>>> requestEntity = new HttpEntity<>(body, headers);
        String url = aiServiceUrl + endpoint;

        try {
            ResponseEntity<AiAnalysisResponseDto> response = restTemplate.postForEntity(
                    url, requestEntity, AiAnalysisResponseDto.class);
            AiAnalysisResponseDto result = response.getBody();
            if (result == null) {
                return emptyFailure();
            }
            return result;
        } catch (RestClientException e) {
            if (!"/analyze".equals(endpoint)) {
                return analyzeImage(bytes, filename, "/analyze");
            }
            return emptyFailure();
        }
    }

    private AiAnalysisResponseDto emptyFailure() {
        AiAnalysisResponseDto dto = new AiAnalysisResponseDto();
        dto.setSuccess(false);
        dto.setDetections(java.util.Collections.emptyList());
        return dto;
    }
}