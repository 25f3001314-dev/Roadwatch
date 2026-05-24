package com.roadwatch.backend.controllers;

import com.roadwatch.backend.dto.ComplaintStatsDto;
import com.roadwatch.backend.dto.ComplaintUpdateRequest;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.services.ComplaintService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    private static final Logger logger = LoggerFactory.getLogger(ComplaintController.class);

    @Autowired
    private ComplaintService complaintService;

    @GetMapping
    public Page<Complaint> listComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String roadType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return complaintService.findComplaints(status, severity, department, roadType, pageable);
    }

    @GetMapping("/map")
    public List<Complaint> mapComplaints() {
        return complaintService.getAllForMap();
    }

    @GetMapping("/stats")
    public ComplaintStatsDto stats() {
        return complaintService.getStats();
    }

    @PostMapping("/reanalyze")
    public List<Complaint> reanalyzeComplaints() {
        return complaintService.reanalyzeComplaintsWithMissingAiLabels();
    }

    @GetMapping("/{id}")
    public Complaint getComplaint(@PathVariable Long id) {
        return complaintService.getById(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Complaint> createComplaint(
            @ModelAttribute Complaint complaint,
            @RequestParam("image") MultipartFile image) {
        Complaint saved = complaintService.createComplaint(complaint, image);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(
            @PathVariable Long id, 
            @RequestBody ComplaintUpdateRequest request) {
        logger.debug("PATCH /api/complaints/{} received with payload: {}", id, request);
        try {
            Complaint updated = complaintService.updateComplaint(id, request);
            logger.info("Successfully updated complaint {}", id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating complaint {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}
