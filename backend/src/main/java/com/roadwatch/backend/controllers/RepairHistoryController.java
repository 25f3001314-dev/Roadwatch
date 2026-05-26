package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.RepairHistory;
import com.roadwatch.backend.repositories.RepairHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/repair-history")
public class RepairHistoryController {

    @Autowired private RepairHistoryRepository repo;

    @GetMapping
    public List<RepairHistory> list(@RequestParam(required = false) Long roadId,
                                    @RequestParam(required = false) Long contractorId,
                                    @RequestParam(required = false) String status) {
        if (roadId != null) return repo.findByRoadIdOrderByStartDateDesc(roadId);
        if (contractorId != null) return repo.findByContractorIdOrderByStartDateDesc(contractorId);
        if (status != null) return repo.findByStatus(status);
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public RepairHistory get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<RepairHistory> create(@RequestBody RepairHistory r) {
        if (r.getStatus() == null) r.setStatus("SCHEDULED");
        return ResponseEntity.ok(repo.save(r));
    }

    @PutMapping("/{id}")
    public RepairHistory update(@PathVariable Long id, @RequestBody RepairHistory r) {
        r.setId(id);
        return repo.save(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
