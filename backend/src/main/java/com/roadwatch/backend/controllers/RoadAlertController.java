package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/alerts")
public class RoadAlertController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public List<Map<String, Object>> getAlerts(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radiusKm) {

        List<Complaint> all = complaintRepository.findAll();
        List<Map<String, Object>> alerts = new ArrayList<>();
        long now = System.currentTimeMillis();

        for (Complaint c : all) {
            // Sirf unresolved complaints
            String status = c.getStatus() != null ? c.getStatus().toUpperCase() : "";
            if (status.equals("RESOLVED") || status.equals("CLOSED")) continue;

            // Location check
            if (c.getLocation() == null) continue;
            double cLat = c.getLocation().getY();
            double cLng = c.getLocation().getX();

            // 10km radius filter (agar lat/lng diya gaya ho)
            if (lat != null && lng != null) {
                double distKm = haversine(lat, lng, cLat, cLng);
                if (distKm > radiusKm) continue;
            }

            // AlertType map karo road type se
            String type = mapToAlertType(c.getRoadType(), c.getDescription());

            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("id", c.getId());
            alert.put("type", type);
            alert.put("description", c.getDescription() != null ? c.getDescription() : "Road issue reported");
            alert.put("locationLabel", c.getLocation() != null ? "Near reported location" : null);
            alert.put("latitude", cLat);
            alert.put("longitude", cLng);
            alert.put("upvotes", c.getUpvotes() != null ? c.getUpvotes() : 0);
            alert.put("upvotedByMe", false);
            alert.put("reporterName", c.getReporterContact() != null ? c.getReporterContact() : "Anonymous");
            alert.put("createdAt", c.getTimestamp() != null ?
                    c.getTimestamp().atZone(java.time.ZoneOffset.UTC).toInstant().toEpochMilli() : now);
            alert.put("lastUpvoteAt", now);
            alerts.add(alert);
        }

        return alerts;
    }

    @PostMapping("/{id}/upvote")
    public Map<String, Object> upvote(@PathVariable Long id) {
        Complaint c = complaintRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Alert not found"));
        Integer current = c.getUpvotes() != null ? c.getUpvotes() : 0;
        c.setUpvotes(current + 1);
        complaintRepository.save(c);

        Map<String, Object> res = new HashMap<>();
        res.put("id", c.getId());
        res.put("upvotes", c.getUpvotes());
        return res;
    }

    @PostMapping
    public Map<String, Object> createAlert(@RequestBody Map<String, Object> body) {
        // Direct alert create — sirf acknowledge karo
        // Real complaints /api/complaints se aati hain
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Use /api/complaints to report road issues");
        return res;
    }

    private String mapToAlertType(String roadType, String description) {
        String combined = ((roadType != null ? roadType : "") +
                " " + (description != null ? description : "")).toUpperCase();
        if (combined.contains("WATER") || combined.contains("FLOOD") || combined.contains("LOGGING"))
            return "WATER_LOGGING";
        if (combined.contains("TRAFFIC") || combined.contains("JAM") || combined.contains("CONGESTION"))
            return "HEAVY_TRAFFIC";
        return "ACCIDENT";
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}
