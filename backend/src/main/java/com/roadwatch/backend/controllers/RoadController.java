package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Road;
import com.roadwatch.backend.services.RoadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roads")
public class RoadController {

    @Autowired
    private RoadService roadService;

    @GetMapping
    public List<Road> list() {
        return roadService.listAll();
    }

    @GetMapping("/{id}")
    public Road get(@PathVariable Long id) {
        return roadService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Road> create(@RequestBody Road road) {
        Road saved = roadService.create(road);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public Road update(@PathVariable Long id, @RequestBody Road payload) {
        return roadService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        roadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
