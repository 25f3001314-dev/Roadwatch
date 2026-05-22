package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiAnalysisResponseDto analyzeImage(MultipartFile file, String endpoint) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        byte[] bytes = file.getBytes();
        ByteArrayResource fileAsResource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", fileAsResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
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
            // Fallback: try /analyze
            if (!"/analyze".equals(endpoint)) {
                return analyzeImage(file, "/analyze");
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
