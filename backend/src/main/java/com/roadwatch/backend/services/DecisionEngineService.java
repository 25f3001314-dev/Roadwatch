package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import com.roadwatch.backend.dto.DetectionResultDto;
import com.roadwatch.backend.models.Complaint;
import org.springframework.stereotype.Service;

@Service
public class DecisionEngineService {

    public void assignSeverityAndDepartment(Complaint complaint, AiAnalysisResponseDto aiResponse) {
        complaint.setSeverity("LOW");
        complaint.setDepartment("Civic Maintenance");
        complaint.setAiLabel(null);
        complaint.setAiConfidence(null);

        if (aiResponse == null || !aiResponse.isSuccess()
                || aiResponse.getDetections() == null || aiResponse.getDetections().isEmpty()) {
            complaint.setAiLabel("none");
            complaint.setAiConfidence(0.0);
            return;
        }

        DetectionResultDto primary = aiResponse.getDetections().get(0);
        String label = primary.getLabel() != null ? primary.getLabel().toLowerCase() : "";
        double confidence = primary.getConfidence();
        String roadType = complaint.getRoadType() != null ? complaint.getRoadType().toUpperCase() : "UNKNOWN";
        boolean isNationalHighway = "NH".equals(roadType);

        complaint.setAiLabel(label);
        complaint.setAiConfidence(confidence);

        switch (label) {
            case "pothole":
                complaint.setDepartment("Roads Authority");
                if (isNationalHighway || confidence > 0.85) {
                    complaint.setSeverity("HIGH");
                } else if (confidence > 0.5) {
                    complaint.setSeverity("MEDIUM");
                } else {
                    complaint.setSeverity("LOW");
                }
                break;

            case "crack":
                complaint.setDepartment("Roads Authority");
                if (isNationalHighway || confidence > 0.8) {
                    complaint.setSeverity("HIGH");
                } else {
                    complaint.setSeverity("MEDIUM");
                }
                break;

            case "surface_damage":
                complaint.setDepartment("Civic Maintenance");
                complaint.setSeverity(isNationalHighway ? "MEDIUM" : "LOW");
                break;

            case "broken_divider":
                complaint.setDepartment("Civic Maintenance");
                complaint.setSeverity(isNationalHighway ? "HIGH" : "MEDIUM");
                break;

            case "street_lighting":
                complaint.setDepartment("Street Lighting");
                complaint.setSeverity(isNationalHighway ? "HIGH" : "MEDIUM");
                break;

            default:
                complaint.setSeverity("LOW");
                complaint.setDepartment("Civic Maintenance");
                break;
        }
    }
}
