package com.roadwatch.backend.services;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.repositories.AuthorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    public List<Authority> listAll() {
        return authorityRepository.findAll();
    }

    public Authority getById(Long id) {
        return authorityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authority not found"));
    }

    public Authority create(Authority authority) {
        return authorityRepository.save(authority);
    }

    public Authority update(Long id, Authority payload) {
        Authority existing = getById(id);
        if (payload.getName() != null) existing.setName(payload.getName());
        if (payload.getDesignation() != null) existing.setDesignation(payload.getDesignation());
        if (payload.getZone() != null) existing.setZone(payload.getZone());
        if (payload.getEmail() != null) existing.setEmail(payload.getEmail());
        if (payload.getPhone() != null) existing.setPhone(payload.getPhone());
        if (payload.getDistrict() != null) existing.setDistrict(payload.getDistrict());
        return authorityRepository.save(existing);
    }

    public void delete(Long id) {
        Authority existing = getById(id);
        authorityRepository.delete(existing);
    }
}
