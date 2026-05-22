package com.roadwatch.backend.services;

import com.roadwatch.backend.models.Road;
import com.roadwatch.backend.repositories.RoadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RoadService {

    @Autowired
    private RoadRepository roadRepository;

    public List<Road> listAll() {
        return roadRepository.findAll();
    }

    public Road getById(Long id) {
        return roadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Road not found"));
    }

    public Road create(Road road) {
        return roadRepository.save(road);
    }

    public Road update(Long id, Road payload) {
        Road existing = getById(id);
        if (payload.getName() != null) existing.setName(payload.getName());
        if (payload.getRoadType() != null) existing.setRoadType(payload.getRoadType());
        if (payload.getContractorName() != null) existing.setContractorName(payload.getContractorName());
        if (payload.getLastRelayingDate() != null) existing.setLastRelayingDate(payload.getLastRelayingDate());
        if (payload.getBudgetSanctioned() != null) existing.setBudgetSanctioned(payload.getBudgetSanctioned());
        if (payload.getBudgetSpent() != null) existing.setBudgetSpent(payload.getBudgetSpent());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());
        return roadRepository.save(existing);
    }

    public void delete(Long id) {
        Road existing = getById(id);
        roadRepository.delete(existing);
    }
}
