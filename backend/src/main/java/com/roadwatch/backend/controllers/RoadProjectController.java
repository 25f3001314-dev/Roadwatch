package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.RoadProject;
import com.roadwatch.backend.repositories.RoadProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/road-projects")
public class RoadProjectController {

    @Autowired private RoadProjectRepository repo;

    @GetMapping
    public List<RoadProject> list(@RequestParam(required = false) String status,
                                  @RequestParam(required = false) Long roadId,
                                  @RequestParam(required = false) Long contractorId) {
        if (status != null) return repo.findByStatus(status);
        if (roadId != null) return repo.findByRoadId(roadId);
        if (contractorId != null) return repo.findByContractorId(contractorId);
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public RoadProject get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<RoadProject> create(@RequestBody RoadProject p) {
        if (p.getStatus() == null) p.setStatus("SANCTIONED");
        return ResponseEntity.ok(repo.save(p));
    }

    @PutMapping("/{id}")
    public RoadProject update(@PathVariable Long id, @RequestBody RoadProject p) {
        p.setId(id);
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
