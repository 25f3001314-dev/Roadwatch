package com.roadwatch.mobile.ui.reports;

import com.google.android.gms.maps.model.LatLng;
import com.google.maps.android.clustering.ClusterItem;
import com.roadwatch.mobile.network.dto.ReportDto;

/**
 * Wraps a {@link ReportDto} so it can participate in
 * {@link com.google.maps.android.clustering.ClusterManager}.
 *
 * Three buckets drive the marker colour:
 *  - PENDING  → red    (critical / not yet acted on)
 *  - IN_PROGRESS / ASSIGNED → yellow (under repair)
 *  - RESOLVED → green
 */
public class ComplaintClusterItem implements ClusterItem {

    public static final int BUCKET_PENDING = 0;     // red
    public static final int BUCKET_IN_PROGRESS = 1; // yellow
    public static final int BUCKET_RESOLVED = 2;    // green

    private final ReportDto report;
    private final LatLng position;
    private final int bucket;

    public ComplaintClusterItem(ReportDto report) {
        this.report = report;
        this.position = new LatLng(report.location.latitude, report.location.longitude);
        this.bucket = computeBucket(report.status);
    }

    public ReportDto getReport() { return report; }
    public int getBucket() { return bucket; }

    @Override
    public LatLng getPosition() { return position; }

    @Override
    public String getTitle() {
        return report.roadType != null ? report.roadType : "Report";
    }

    @Override
    public String getSnippet() {
        return report.status != null ? report.status : "";
    }

    @Override
    public Float getZIndex() {
        // Pending/critical floats above resolved markers.
        return (float) (3 - bucket);
    }

    private static int computeBucket(String status) {
        if (status == null) return BUCKET_PENDING;
        switch (status.toUpperCase()) {
            case "RESOLVED":
            case "FIXED":
            case "CLOSED":
                return BUCKET_RESOLVED;
            case "IN_PROGRESS":
            case "ASSIGNED":
            case "UNDER_REPAIR":
                return BUCKET_IN_PROGRESS;
            case "PENDING":
            case "REPORTED":
            case "OPEN":
            default:
                return BUCKET_PENDING;
        }
    }
}
