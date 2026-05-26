package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Contractor;
import com.roadwatch.backend.repositories.ContractorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/contractors")
public class ContractorController {

    @Autowired private ContractorRepository contractorRepository;

    @GetMapping
    public Page<Contractor> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean blacklisted,
            @RequestParam(required = false) String state) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("name").ascending());
        return contractorRepository.findAll(pr).map(c -> {
            // post-filter (no specifications needed for this scale)
            return c;
        });
    }

    @GetMapping("/{id}")
    public Contractor get(@PathVariable Long id) {
        return contractorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Contractor> create(@RequestBody Contractor c) {
        if (c.getRegisteredSince() == null) c.setRegisteredSince(java.time.LocalDate.now());
        if (c.getBlacklisted() == null) c.setBlacklisted(false);
        return ResponseEntity.ok(contractorRepository.save(c));
    }

    @PutMapping("/{id}")
    public Contractor update(@PathVariable Long id, @RequestBody Contractor body) {
        Contractor existing = get(id);
        body.setId(id);
        if (body.getRegisteredSince() == null) body.setRegisteredSince(existing.getRegisteredSince());
        return contractorRepository.save(body);
    }

    @PostMapping("/{id}/blacklist")
    public Contractor blacklist(@PathVariable Long id, @RequestBody java.util.Map<String,String> body) {
        Contractor c = get(id);
        c.setBlacklisted(true);
        c.setBlacklistReason(body.getOrDefault("reason", "Repeated quality failures"));
        return contractorRepository.save(c);
    }

    @PostMapping("/{id}/unblacklist")
    public Contractor unblacklist(@PathVariable Long id) {
        Contractor c = get(id);
        c.setBlacklisted(false);
        c.setBlacklistReason(null);
        return contractorRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        contractorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
