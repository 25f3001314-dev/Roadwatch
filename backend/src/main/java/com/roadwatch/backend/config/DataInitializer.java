package com.roadwatch.backend.config;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.models.Road;
import com.roadwatch.backend.repositories.AuthorityRepository;
import com.roadwatch.backend.repositories.RoadRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoadRepository roadRepository;
    private final AuthorityRepository authorityRepository;

    public DataInitializer(RoadRepository roadRepository, AuthorityRepository authorityRepository) {
        this.roadRepository = roadRepository;
        this.authorityRepository = authorityRepository;
    }

    @Override
    public void run(String... args) {
        if (roadRepository.count() == 0) {
            roadRepository.saveAll(List.of(
                    createRoad(
                            "ROAD-NH-01",
                            "Delhi-Meerut Expressway",
                            "NH",
                            "L&T Infra",
                            450_000_000d,
                            420_000_000d,
                            "IN_PROGRESS"
                    ),
                    createRoad(
                            "ROAD-NH-28",
                            "Gorakhpur-Basti Highway",
                            "NH",
                            "Tata Projects",
                            620_000_000d,
                            580_000_000d,
                            "IN_PROGRESS"
                    ),
                    createRoad(
                            "ROAD-SH-12",
                            "Lucknow-Barabanki Highway",
                            "SH",
                            "Dilip Buildcon",
                            180_000_000d,
                            195_000_000d,
                            "IN_PROGRESS"
                    )
            ));
        }

        if (authorityRepository.count() == 0) {
            authorityRepository.saveAll(List.of(
                    createAuthority("Er. Rajesh Kumar Sharma", "EE", "North Zone", "ee.north@gov.in"),
                    createAuthority("Er. Anil Kumar Verma", "EE", "Central Zone", "ee.central@gov.in")
            ));
        }
    }

    private Road createRoad(
            String roadCode,
            String name,
            String roadType,
            String contractorName,
            Double budgetSanctioned,
            Double budgetSpent,
            String status
    ) {
        Road road = new Road();
        road.setRoadCode(roadCode);
        road.setName(name);
        road.setRoadType(roadType);
        road.setContractorName(contractorName);
        road.setBudgetSanctioned(budgetSanctioned);
        road.setBudgetSpent(budgetSpent);
        road.setStatus(status);
        return road;
    }

    private Authority createAuthority(String name, String designation, String zone, String email) {
        Authority authority = new Authority();
        authority.setName(name);
        authority.setDesignation(designation);
        authority.setZone(zone);
        authority.setEmail(email);
        return authority;
    }
}
