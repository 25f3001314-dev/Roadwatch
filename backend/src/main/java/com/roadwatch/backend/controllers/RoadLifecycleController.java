package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.*;
import com.roadwatch.backend.repositories.*;
import com.roadwatch.backend.services.AccountabilityScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

/**
 * One-shot lifecycle endpoint for a road. Returns:
 *   - the road meta
 *   - inspection logs
 *   - repair history
 *   - active project(s)
 *   - maintenance schedule
 *   - related complaints
 *   - computed health score
 *
 * Public read access powers both the admin dashboard and a future mobile
 * Road Intelligence screen.
 */
@RestController
@RequestMapping("/api/roads")
public class RoadLifecycleController {

    @Autowired private RoadRepository roadRepository;
    @Autowired private RoadInspectionLogRepository inspectionRepo;
    @Autowired private RepairHistoryRepository repairRepo;
    @Autowired private RoadProjectRepository projectRepo;
    @Autowired private MaintenanceScheduleRepository scheduleRepo;
    @Autowired private ComplaintRepository complaintRepo;
    @Autowired private AccountabilityScoringService scoring;

    @GetMapping("/{id}/lifecycle")
    public Map<String, Object> lifecycle(@PathVariable Long id) {
        Road road = roadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Road not found"));

        Map<String, Object> out = new HashMap<>();
        out.put("road", road);
        out.put("healthScore", scoring.computeRoadHealthScore(road));
        out.put("inspectionLogs", inspectionRepo.findByRoadIdOrderByInspectionDateDesc(id));
        out.put("repairHistory", repairRepo.findByRoadIdOrderByStartDateDesc(id));
        out.put("projects", projectRepo.findByRoadId(id));
        out.put("maintenance", scheduleRepo.findByRoadId(id));
        out.put("complaints", complaintRepo.findAll().stream()
                .filter(c -> id.equals(c.getRoadId())).toList());
        return out;
    }
}
