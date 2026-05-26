package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.services.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Officers / Employees endpoint.
 *
 * In the RoadWatch domain an "officer" or "field employee" is represented by
 * the {@link Authority} entity (each row carries name, designation, zone,
 * email, phone and district). This controller is a thin alias over
 * {@link AuthorityService} that exposes the data under a more intuitive URL
 * for the admin UI.
 */
@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    @Autowired
    private AuthorityService authorityService;

    @GetMapping
    public List<Authority> list(@RequestParam(required = false) String department,
                                @RequestParam(required = false) String district) {
        List<Authority> all = authorityService.listAll();
        if (department != null && !department.isBlank()) {
            all = all.stream()
                    .filter(a -> a.getZone() != null && a.getZone().toLowerCase().contains(department.toLowerCase()))
                    .toList();
        }
        if (district != null && !district.isBlank()) {
            all = all.stream()
                    .filter(a -> a.getDistrict() != null && a.getDistrict().toLowerCase().contains(district.toLowerCase()))
                    .toList();
        }
        return all;
    }

    @GetMapping("/{id}")
    public Authority get(@PathVariable Long id) {
        return authorityService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Authority> create(@RequestBody Authority authority) {
        return ResponseEntity.ok(authorityService.create(authority));
    }

    @PutMapping("/{id}")
    public Authority update(@PathVariable Long id, @RequestBody Authority payload) {
        return authorityService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        authorityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
