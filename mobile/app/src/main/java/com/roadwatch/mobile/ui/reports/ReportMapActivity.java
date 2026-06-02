package com.roadwatch.mobile.ui.reports;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.location.Location;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.maps.android.clustering.ClusterManager;
import com.roadwatch.mobile.R;
import com.roadwatch.mobile.network.ApiClient;
import com.roadwatch.mobile.network.ApiService;
import com.roadwatch.mobile.network.ReportRepository;
import com.roadwatch.mobile.network.dto.AlertType;
import com.roadwatch.mobile.network.dto.ReportDto;
import com.roadwatch.mobile.network.dto.RoadAlertDto;
import com.roadwatch.mobile.ui.BaseActivity;
import com.roadwatch.mobile.ui.alerts.AlertGeo;
import com.roadwatch.mobile.ui.alerts.RoadAlertsActivity;
import com.roadwatch.mobile.ui.complaints.ComplaintDetailActivity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Interactive map of all reported road defects.
 *
 * Step 7 features:
 *  • Fetches complaints from {@code GET /api/complaints} (via ReportRepository,
 *    which also merges local-only items).
 *  • Renders each as a coloured marker (red/yellow/green) by status bucket.
 *  • Marker clustering via maps-utils ClusterManager.
 *  • Custom info window with thumbnail + road type + status; tap → ComplaintDetailActivity.
 *  • "My Location" FAB centres on user; auto-zoom to current location on launch.
 *  • Status filter FAB to focus on one bucket.
 */
public class ReportMapActivity extends BaseActivity implements OnMapReadyCallback {

    private static final String TAG = "ReportMapActivity";
    private static final int REQ_LOCATION = 401;
    private static final float DEFAULT_USER_ZOOM = 15f;
    private static final float DEFAULT_INDIA_ZOOM = 5f;
    private static final LatLng INDIA_CENTER = new LatLng(20.5937, 78.9629);

    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();

    private GoogleMap googleMap;
    private ClusterManager<ComplaintClusterItem> clusterManager;
    private ComplaintInfoWindowAdapter infoWindowAdapter;
    private FusedLocationProviderClient fusedLocation;

    private ProgressBar mapProgress;
    private TextView tvMapError;
    private FloatingActionButton fabMyLocation;
    private FloatingActionButton fabFilter;

    private List<ReportDto> loadedReports = new ArrayList<>();
    private final Map<Marker, ReportDto> markerToReport = new HashMap<>();
    private int activeFilter = FILTER_ALL;

    // Live road alerts (Step 9). Tracked separately from clustered pothole
    // markers so the two layers never visually merge.
    private final List<RoadAlertDto> loadedAlerts = new ArrayList<>();
    private final Set<Marker> alertMarkers = new HashSet<>();
    private final Map<Marker, RoadAlertDto> alertMarkerLookup = new HashMap<>();
    private boolean showAlerts = true;

    // Filter buckets — keep aligned with ComplaintClusterItem buckets where applicable.
    private static final int FILTER_ALL = -1;
    private static final int FILTER_PENDING = ComplaintClusterItem.BUCKET_PENDING;
    private static final int FILTER_IN_PROGRESS = ComplaintClusterItem.BUCKET_IN_PROGRESS;
    private static final int FILTER_RESOLVED = ComplaintClusterItem.BUCKET_RESOLVED;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report_map);
        setupToolbar("Pothole Map");

        mapProgress = findViewById(R.id.mapProgress);
        tvMapError = findViewById(R.id.tvMapError);
        fabMyLocation = findViewById(R.id.fabMyLocation);
        fabFilter = findViewById(R.id.fabFilter);

        fabMyLocation.setOnClickListener(v -> centerOnMyLocation(true));
        fabFilter.setOnClickListener(v -> showFilterDialog());

        fusedLocation = LocationServices.getFusedLocationProviderClient(this);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.mapFragment);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        loadReports();
        loadAlerts();
    }

    // ─────────── Map setup ───────────

    @Override
    public void onMapReady(@NonNull GoogleMap map) {
        this.googleMap = map;
        googleMap.getUiSettings().setZoomControlsEnabled(true);
        googleMap.getUiSettings().setMapToolbarEnabled(false);

        // Default camera — switched to user's location once we get a fix.
        googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(INDIA_CENTER, DEFAULT_INDIA_ZOOM));

        setupClusterManager();
        enableMyLocationLayer();
        zoomToUserLocation();

        if (!loadedReports.isEmpty()) {
            plotReports();
        }
        if (!loadedAlerts.isEmpty()) {
            plotAlerts();
        }
        wireMarkerClickInterceptor();
    }

    private void setupClusterManager() {
        clusterManager = new ClusterManager<>(this, googleMap);
        ComplaintClusterRenderer renderer = new ComplaintClusterRenderer(this, googleMap, clusterManager);
        clusterManager.setRenderer(renderer);

        // Wrap cluster manager's idle listener so we also refresh the marker
        // lookup whenever the camera settles after pan/zoom (clusters re-form).
        googleMap.setOnCameraIdleListener(() -> {
            clusterManager.onCameraIdle();
            refreshMarkerLookup();
        });
        googleMap.setOnMarkerClickListener(clusterManager);
        googleMap.setOnInfoWindowClickListener(clusterManager);

        infoWindowAdapter = new ComplaintInfoWindowAdapter(this, markerToReport);
        clusterManager.getMarkerCollection().setInfoWindowAdapter(infoWindowAdapter);

        // Tap on cluster → zoom in.
        clusterManager.setOnClusterClickListener(cluster -> {
            LatLngBounds.Builder bounds = LatLngBounds.builder();
            for (ComplaintClusterItem item : cluster.getItems()) {
                bounds.include(item.getPosition());
            }
            try {
                googleMap.animateCamera(
                        CameraUpdateFactory.newLatLngBounds(bounds.build(), 200));
            } catch (Exception ignored) {}
            return true;
        });

        // Single marker tapped → make sure marker→report mapping is current
        // before the InfoWindow asks the adapter for content.
        clusterManager.setOnClusterItemClickListener(item -> {
            refreshMarkerLookup();
            return false; // false = let manager show default info window
        });

        // Info window tap → open detail.
        clusterManager.setOnClusterItemInfoWindowClickListener(item -> {
            ReportDto report = item.getReport();
            if (report.id == null) {
                Toast.makeText(this,
                        "This report hasn't synced yet — check it from My Complaints",
                        Toast.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, ComplaintDetailActivity.class);
            intent.putExtra(ComplaintDetailActivity.EXTRA_COMPLAINT_ID, report.id);
            startActivity(intent);
        });
    }

    // ─────────── Data ───────────

    private void loadReports() {
        mapProgress.setVisibility(View.VISIBLE);
        tvMapError.setVisibility(View.GONE);

        ioExecutor.execute(() -> {
            try {
                List<ReportDto> reports = new ReportRepository(this).fetchReports();
                runOnUiThread(() -> {
                    loadedReports = reports;
                    mapProgress.setVisibility(View.GONE);
                    if (googleMap != null) plotReports();
                });
            } catch (Exception e) {
                Log.e(TAG, "Failed to load reports", e);
                runOnUiThread(() -> {
                    mapProgress.setVisibility(View.GONE);
                    if (loadedReports != null && !loadedReports.isEmpty()) {
                        if (googleMap != null) plotReports();
                    } else {
                        tvMapError.setVisibility(View.VISIBLE);
                        tvMapError.setText("Could not load reports: " + e.getMessage());
                    }
                });
            }
        });
    }

    private void plotReports() {
        if (clusterManager == null) return;

        clusterManager.clearItems();
        markerToReport.clear();

        int plotted = 0;
        for (ReportDto report : loadedReports) {
            if (report.location == null) continue;
            ComplaintClusterItem item = new ComplaintClusterItem(report);

            if (activeFilter != FILTER_ALL && item.getBucket() != activeFilter) {
                continue;
            }
            clusterManager.addItem(item);
            plotted++;
        }
        clusterManager.cluster();
        Log.i(TAG, "Plotted " + plotted + " of " + loadedReports.size() + " reports (filter=" + activeFilter + ")");
        refreshMarkerLookup();

        if (plotted == 0) {
            tvMapError.setVisibility(View.VISIBLE);
            tvMapError.setText(activeFilter == FILTER_ALL
                    ? "No reports with GPS yet."
                    : "No reports match this filter.");
        } else {
            tvMapError.setVisibility(View.GONE);
        }
    }

    /** Synchronises the marker → report map for the InfoWindowAdapter. */
    private void refreshMarkerLookup() {
        if (clusterManager == null) return;
        markerToReport.clear();
        for (Marker marker : clusterManager.getMarkerCollection().getMarkers()) {
            // The cluster manager doesn't expose Marker→ClusterItem directly,
            // so we match by lat/lng (positions are identical).
            LatLng pos = marker.getPosition();
            for (ReportDto report : loadedReports) {
                if (report.location != null
                        && Math.abs(report.location.latitude - pos.latitude) < 1e-6
                        && Math.abs(report.location.longitude - pos.longitude) < 1e-6) {
                    markerToReport.put(marker, report);
                    break;
                }
            }
        }
    }

    // ─────────── My Location ───────────

    @SuppressLint("MissingPermission")
    private void enableMyLocationLayer() {
        if (hasLocationPermission()) {
            try {
                googleMap.setMyLocationEnabled(true);
                googleMap.getUiSettings().setMyLocationButtonEnabled(false); // we provide our own FAB
            } catch (SecurityException e) {
                Log.w(TAG, "setMyLocationEnabled denied", e);
            }
        }
    }

    private void zoomToUserLocation() {
        if (!hasLocationPermission()) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    REQ_LOCATION);
            return;
        }
        centerOnMyLocation(false);
    }

    @SuppressLint("MissingPermission")
    private void centerOnMyLocation(boolean fromButton) {
        if (!hasLocationPermission()) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    REQ_LOCATION);
            return;
        }
        fusedLocation.getLastLocation().addOnSuccessListener(location -> {
            if (location == null) {
                if (fromButton) {
                    Toast.makeText(this,
                            "Waiting for GPS fix — try again in a moment",
                            Toast.LENGTH_SHORT).show();
                }
                return;
            }
            LatLng me = new LatLng(location.getLatitude(), location.getLongitude());
            googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(me, DEFAULT_USER_ZOOM));
            Log.i(TAG, "Centred on user location " + me);
        });
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_LOCATION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                enableMyLocationLayer();
                centerOnMyLocation(false);
            } else {
                Toast.makeText(this,
                        "Location permission denied — showing all reports instead",
                        Toast.LENGTH_SHORT).show();
                fitCameraToReports();
            }
        }
    }

    private void fitCameraToReports() {
        if (googleMap == null || loadedReports.isEmpty()) return;
        LatLngBounds.Builder bounds = LatLngBounds.builder();
        boolean any = false;
        for (ReportDto r : loadedReports) {
            if (r.location != null) {
                bounds.include(new LatLng(r.location.latitude, r.location.longitude));
                any = true;
            }
        }
        if (any) {
            try {
                googleMap.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds.build(), 200));
            } catch (Exception ignored) {}
        }
    }

    // ─────────── Filter ───────────

    private void showFilterDialog() {
        String[] options = {"All reports", "Pending", "Under repair", "Resolved"};
        int currentIndex = (activeFilter == FILTER_ALL) ? 0 : activeFilter + 1;

        new AlertDialog.Builder(this)
                .setTitle("Filter by status")
                .setSingleChoiceItems(options, currentIndex, (dialog, which) -> {
                    activeFilter = (which == 0) ? FILTER_ALL : (which - 1);
                    Log.i(TAG, "Filter changed to " + activeFilter);
                    plotReports();
                    dialog.dismiss();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        ioExecutor.shutdown();
    }

    // ─────────── Step 9: Live road alerts on map ───────────

    /**
     * Intercept marker clicks: if it's an alert marker we handle it ourselves
     * (custom info window content + toast), otherwise we let ClusterManager
     * handle it the way it always has.
     */
    private void wireMarkerClickInterceptor() {
        googleMap.setOnMarkerClickListener(marker -> {
            if (alertMarkers.contains(marker)) {
                marker.showInfoWindow();
                return true;
            }
            return clusterManager.onMarkerClick(marker);
        });

        googleMap.setOnInfoWindowClickListener(marker -> {
            RoadAlertDto alert = alertMarkerLookup.get(marker);
            if (alert != null) {
                // Tapping an alert info window opens the alerts feed so the
                // user can confirm/upvote it from the dedicated screen.
                startActivity(new Intent(this, RoadAlertsActivity.class));
            } else {
                clusterManager.onInfoWindowClick(marker);
            }
        });
    }

    private void loadAlerts() {
        ApiService api = ApiClient.api(this);
        Double lat = null, lng = null;
        // Backend filter is best-effort; client also filters in plotAlerts().
        api.getAlerts(lat, lng, 25.0).enqueue(new Callback<List<RoadAlertDto>>() {
            @Override
            public void onResponse(@NonNull Call<List<RoadAlertDto>> call,
                                   @NonNull Response<List<RoadAlertDto>> response) {
                loadedAlerts.clear();
                if (response.isSuccessful() && response.body() != null) {
                    loadedAlerts.addAll(response.body());
                }
                Log.i(TAG, "Loaded " + loadedAlerts.size() + " road alerts");
                if (googleMap != null) plotAlerts();
            }

            @Override
            public void onFailure(@NonNull Call<List<RoadAlertDto>> call,
                                  @NonNull Throwable t) {
                Log.w(TAG, "Could not load road alerts: " + t.getMessage());
            }
        });
    }

    private void plotAlerts() {
        // Wipe existing alert markers so we don't duplicate on refresh.
        for (Marker marker : alertMarkers) marker.remove();
        alertMarkers.clear();
        alertMarkerLookup.clear();

        if (!showAlerts) return;
        long now = System.currentTimeMillis();
        int rendered = 0;

        for (RoadAlertDto alert : loadedAlerts) {
            if (alert.isExpired(now)) continue;
            if (alert.latitude == null || alert.longitude == null) continue;

            AlertType type = alert.resolveType();
            BitmapDescriptor icon = bitmapFromVector(type.markerRes);
            if (icon == null) icon = BitmapDescriptorFactory.defaultMarker(
                    BitmapDescriptorFactory.HUE_ORANGE);

            String snippet = "Reported " + DateUtils.timeAgo(alert.resolveCreatedAt(), now)
                    + " • " + alert.resolveUpvotes() + " confirms";

            Marker marker = googleMap.addMarker(new MarkerOptions()
                    .position(new LatLng(alert.latitude, alert.longitude))
                    .icon(icon)
                    .anchor(0.5f, 1.0f)
                    .title(type.displayLabel)
                    .snippet(snippet)
                    .zIndex(10f)); // above pothole markers
            if (marker != null) {
                alertMarkers.add(marker);
                alertMarkerLookup.put(marker, alert);
                rendered++;
            }
        }
        Log.i(TAG, "Plotted " + rendered + " active alerts on map");
    }

    /** Vector-drawable → bitmap descriptor for alert markers. */
    private BitmapDescriptor bitmapFromVector(int vectorRes) {
        Drawable drawable = ContextCompat.getDrawable(this, vectorRes);
        if (drawable == null) return null;
        int width = drawable.getIntrinsicWidth();
        int height = drawable.getIntrinsicHeight();
        if (width <= 0 || height <= 0) {
            width = 96;
            height = 128;
        }
        drawable.setBounds(0, 0, width, height);
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        drawable.draw(canvas);
        return BitmapDescriptorFactory.fromBitmap(bitmap);
    }

    /** Tiny helper kept inside this file to avoid pulling in DateUtils elsewhere. */
    private static class DateUtils {
        static String timeAgo(long millis, long now) {
            long diff = Math.max(0, now - millis);
            long minutes = diff / 60_000L;
            if (minutes < 1) return "just now";
            if (minutes < 60) return minutes + " min ago";
            long hours = minutes / 60;
            if (hours < 24) return hours + " hr ago";
            return (hours / 24) + " d ago";
        }
    }
}
