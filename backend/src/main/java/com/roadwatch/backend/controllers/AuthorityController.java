package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.services.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authorities")
public class AuthorityController {

    @Autowired
    private AuthorityService authorityService;

    @GetMapping
    public List<Authority> list() {
        return authorityService.listAll();
    }

    @GetMapping("/{id}")
    public Authority get(@PathVariable Long id) {
        return authorityService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Authority> create(@RequestBody Authority authority) {
        Authority saved = authorityService.create(authority);
        return ResponseEntity.ok(saved);
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
