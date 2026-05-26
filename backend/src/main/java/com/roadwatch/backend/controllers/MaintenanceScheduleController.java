package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.MaintenanceSchedule;
import com.roadwatch.backend.repositories.MaintenanceScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance-schedules")
public class MaintenanceScheduleController {

    @Autowired private MaintenanceScheduleRepository repo;

    @GetMapping
    public List<MaintenanceSchedule> list(@RequestParam(required = false) Long roadId,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(required = false) Boolean overdue) {
        if (roadId != null) return repo.findByRoadId(roadId);
        if (status != null) return repo.findByStatus(status);
        if (Boolean.TRUE.equals(overdue)) return repo.findByScheduledDateBefore(LocalDate.now());
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public MaintenanceSchedule get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<MaintenanceSchedule> create(@RequestBody MaintenanceSchedule m) {
        if (m.getStatus() == null) m.setStatus("SCHEDULED");
        return ResponseEntity.ok(repo.save(m));
    }

    @PutMapping("/{id}")
    public MaintenanceSchedule update(@PathVariable Long id, @RequestBody MaintenanceSchedule m) {
        m.setId(id);
        return repo.save(m);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
