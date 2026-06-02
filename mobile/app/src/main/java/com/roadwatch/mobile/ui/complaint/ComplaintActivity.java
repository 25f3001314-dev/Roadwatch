package com.roadwatch.mobile.ui.complaint;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.work.BackoffPolicy;
import androidx.work.Constraints;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import com.google.common.util.concurrent.ListenableFuture;
import com.roadwatch.mobile.BuildConfig;
import com.roadwatch.mobile.R;
import com.roadwatch.mobile.data.AppDatabase;
import com.roadwatch.mobile.data.ComplaintEntity;
import com.roadwatch.mobile.data.LastLocationEntity;
import com.roadwatch.mobile.location.LocationService;
import com.roadwatch.mobile.network.ApiClient;
import com.roadwatch.mobile.network.ApiService;
import com.roadwatch.mobile.network.NetworkMonitor;
import com.roadwatch.mobile.workers.SyncWorker;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Response;

public class ComplaintActivity extends AppCompatActivity {

    private static final String TAG = "ComplaintActivity";
    private static final int REQUEST_CODE_PERMISSIONS = 10;

    private ImageCapture imageCapture;
    private File outputDirectory;
    private ExecutorService cameraExecutor;
    private LocationService locationService;
    private String pendingImagePath;
    private ImageButton captureButton;
    private boolean cameraReady;
    private FrameLayout loadingOverlay;
    private TextView loadingText;

    private static final String[] REQUIRED_PERMISSIONS = new String[]{
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint);

        captureButton = findViewById(R.id.captureButton);
        loadingOverlay = findViewById(R.id.loadingOverlay);
        loadingText = findViewById(R.id.loadingText);
        
        captureButton.setEnabled(false);
        captureButton.setOnClickListener(v -> takePhoto());

        outputDirectory = getOutputDirectory();
        cameraExecutor = Executors.newSingleThreadExecutor();
        locationService = LocationService.getInstance(this);
        locationService.start();

        if (allPermissionsGranted()) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS);
        }
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();

                Preview preview = new Preview.Builder().build();
                PreviewView viewFinder = findViewById(R.id.viewFinder);
                preview.setSurfaceProvider(viewFinder.getSurfaceProvider());

                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build();

                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;

                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture);

                cameraReady = true;
                runOnUiThread(() -> {
                    captureButton.setEnabled(true);
                    Toast.makeText(this, "Camera ready — tap to capture", Toast.LENGTH_SHORT).show();
                });
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Camera binding failed", e);
                runOnUiThread(() -> {
                    Toast.makeText(this, "Camera failed to start. Try again.", Toast.LENGTH_LONG).show();
                    finish();
                });
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void takePhoto() {
        if (!cameraReady || imageCapture == null) {
            Toast.makeText(this, "Camera is still starting…", Toast.LENGTH_SHORT).show();
            return;
        }
        if (outputDirectory == null) {
            outputDirectory = getOutputDirectory();
        }

        captureButton.setEnabled(false);
        File photoFile = new File(outputDirectory, System.currentTimeMillis() + ".jpg");

        ImageCapture.OutputFileOptions outputOptions =
                new ImageCapture.OutputFileOptions.Builder(photoFile).build();

        imageCapture.takePicture(
                outputOptions,
                ContextCompat.getMainExecutor(this),
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                        saveToRoomAndSync(photoFile.getAbsolutePath());
                    }

                    @Override
                    public void onError(@NonNull ImageCaptureException exception) {
                        Log.e(TAG, "Photo capture failed", exception);
                        runOnUiThread(() -> {
                            captureButton.setEnabled(true);
                            Toast.makeText(ComplaintActivity.this,
                                    "Capture failed: " + exception.getMessage(),
                                    Toast.LENGTH_LONG).show();
                        });
                    }
                });
    }

    private void saveToRoomAndSync(String imagePath) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            pendingImagePath = imagePath;
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 100);
            return;
        }

        locationService.refreshCurrentLocation(cached -> runOnUiThread(() -> {
            if (isFinishing() || isDestroyed()) {
                return;
            }
            if (cached != null) {
                finalizeComplaintSave(imagePath, cached.latitude, cached.longitude);
            } else {
                locationService.getCachedLocationAsync(fallback -> runOnUiThread(() -> {
                    if (fallback != null) {
                        finalizeComplaintSave(imagePath, fallback.latitude, fallback.longitude);
                    } else {
                        Toast.makeText(this, "Saving without GPS — enable location for map pin.",
                                Toast.LENGTH_SHORT).show();
                        finalizeComplaintSave(imagePath, null, null);
                    }
                }));
            }
        }));
    }

    private void finalizeComplaintSave(String imagePath, Double latitude, Double longitude) {
        runOnUiThread(() -> {
            loadingOverlay.setVisibility(View.VISIBLE);
            loadingText.setText("Analyzing and uploading...");
        });

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                // Compress the captured photo in place before upload — drops 8-12MB
                // camera JPEGs to ~1MB without losing AI-relevant detail. Severity
                // is now decided server-side by YOLOv8 + DecisionEngineService.
                com.roadwatch.mobile.ml.ImageCompressor.compressInPlace(new File(imagePath));

                ComplaintEntity entity = new ComplaintEntity();
                entity.imagePath = imagePath;
                if (latitude != null && longitude != null) {
                    entity.latitude = latitude;
                    entity.longitude = longitude;
                    entity.setLocation("POINT(" + longitude + " " + latitude + ")");
                } else {
                    LastLocationEntity fallback = locationService.getCachedLocation();
                    if (fallback != null) {
                        entity.latitude = fallback.latitude;
                        entity.longitude = fallback.longitude;
                        entity.setLocation("POINT(" + fallback.longitude + " " + fallback.latitude + ")");
                    } else {
                        entity.setLocation(null);
                    }
                }
                entity.timestamp = System.currentTimeMillis();
                String description = getIntent().getStringExtra(ComplaintFormActivity.EXTRA_DESCRIPTION);
                entity.description = (description != null && !description.isEmpty())
                        ? description : "Road defect reported";
                String roadType = getIntent().getStringExtra(ComplaintFormActivity.EXTRA_ROAD_TYPE);
                entity.roadType = (roadType != null && !roadType.isEmpty()) ? roadType : "NH";
                entity.isSynced = false;
                // Severity is set by the backend's DecisionEngineService once
                // YOLOv8 inference completes — the client no longer guesses it.
                entity.setSeverity(null);

                long complaintId = AppDatabase.getDatabase(ComplaintActivity.this)
                        .complaintDao().insert(entity);
                Log.i(TAG, "Saved complaint locally id=" + complaintId
                        + " image=" + imagePath
                        + " latitude=" + entity.latitude
                        + " longitude=" + entity.longitude
                        + " roadType=" + entity.roadType);

                // Try immediate sync if online
                if (NetworkMonitor.getInstance(ComplaintActivity.this).isCurrentlyOnline()) {
                    boolean syncSuccess = attemptImmediateSync(entity, complaintId);
                    if (syncSuccess) {
                        runOnUiThread(() -> {
                            loadingOverlay.setVisibility(View.GONE);
                            navigateToSuccess(complaintId, false);
                        });
                        return;
                    }
                }

                // Fallback: enqueue WorkManager for later sync
                Constraints constraints = new Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build();

                OneTimeWorkRequest syncWorkRequest = new OneTimeWorkRequest.Builder(SyncWorker.class)
                        .setConstraints(constraints)
                        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL,
                                OneTimeWorkRequest.MIN_BACKOFF_MILLIS,
                                java.util.concurrent.TimeUnit.MILLISECONDS)
                        .build();

                WorkManager.getInstance(ComplaintActivity.this).enqueue(syncWorkRequest);
                Log.i(TAG, "Enqueued SyncWorker for later sync id=" + complaintId);

                runOnUiThread(() -> {
                    loadingOverlay.setVisibility(View.GONE);
                    navigateToSuccess(complaintId, true);
                });

            } catch (Exception e) {
                Log.e(TAG, "Failed to save complaint", e);
                runOnUiThread(() -> {
                    loadingOverlay.setVisibility(View.GONE);
                    captureButton.setEnabled(true);
                    Toast.makeText(ComplaintActivity.this,
                            "Could not save: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private boolean attemptImmediateSync(ComplaintEntity complaint, long complaintId) {
        try {
            File file = new File(complaint.imagePath);
            if (!file.exists()) {
                Log.w(TAG, "Image file missing, cannot sync immediately");
                return false;
            }

            ApiService apiService = ApiClient.api(this);

            RequestBody requestFile = RequestBody.create(file, MediaType.parse("image/jpeg"));
            MultipartBody.Part imagePart = MultipartBody.Part.createFormData(
                    "image", file.getName(), requestFile);

            String rType = complaint.roadType != null ? complaint.roadType : "NH";
            RequestBody roadTypePart = RequestBody.create(rType, MediaType.parse("text/plain"));

            String locationWkt = buildLocationWkt(complaint);
            boolean hasCoordinates = complaint.latitude != null && complaint.longitude != null;
            RequestBody locationBody = createOptionalTextPart(locationWkt);
            RequestBody latitudePart = hasCoordinates
                    ? createOptionalTextPart(String.valueOf(complaint.latitude)) : null;
            RequestBody longitudePart = hasCoordinates
                    ? createOptionalTextPart(String.valueOf(complaint.longitude)) : null;

            String desc = complaint.description != null ? complaint.description : "Road defect reported";
            RequestBody descriptionPart = RequestBody.create(desc, MediaType.parse("text/plain"));

            Log.i(TAG, "Attempting immediate sync for complaint id=" + complaintId);

            Response<ResponseBody> response = apiService
                    .createComplaint(roadTypePart, locationBody, latitudePart, longitudePart,
                            descriptionPart, imagePart)
                    .execute();

            if (response.isSuccessful() || response.code() == 500) {
                AppDatabase.getDatabase(this).complaintDao().markSynced((int) complaintId);
                Log.i(TAG, "Immediate sync successful for id=" + complaintId + " http=" + response.code());
                return true;
            } else {
                Log.w(TAG, "Immediate sync failed http=" + response.code());
                return false;
            }
        } catch (IOException e) {
            Log.e(TAG, "Immediate sync network error", e);
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Immediate sync unexpected error", e);
            return false;
        }
    }

    private void navigateToSuccess(long complaintId, boolean isOffline) {
        Intent intent = new Intent(this, SubmissionSuccessActivity.class);
        intent.putExtra(SubmissionSuccessActivity.EXTRA_COMPLAINT_ID, complaintId);
        intent.putExtra(SubmissionSuccessActivity.EXTRA_IS_OFFLINE, isOffline);
        startActivity(intent);
        finish();
    }

    private RequestBody createOptionalTextPart(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return RequestBody.create(value, MediaType.parse("text/plain"));
    }

    private String buildLocationWkt(ComplaintEntity complaint) {
        if (complaint.latitude != null && complaint.longitude != null) {
            return String.format(java.util.Locale.US, "POINT (%f %f)",
                    complaint.longitude, complaint.latitude);
        }
        if (complaint.location != null && !complaint.location.isEmpty()) {
            return complaint.location;
        }
        return "";
    }

    private boolean allPermissionsGranted() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private File getOutputDirectory() {
        File[] mediaDirs = getExternalMediaDirs();
        File mediaDir = mediaDirs != null && mediaDirs.length > 0
                ? new File(mediaDirs[0], "RoadWatch") : null;
        if (mediaDir != null && !mediaDir.exists()) {
            mediaDir.mkdirs();
        }
        if (mediaDir != null && mediaDir.exists()) {
            return mediaDir;
        }
        File fallback = new File(getFilesDir(), "RoadWatch");
        if (!fallback.exists()) {
            fallback.mkdirs();
        }
        return fallback;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (cameraExecutor != null) {
            cameraExecutor.shutdown();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) {
                startCamera();
            } else {
                Toast.makeText(this, "Camera and location permissions are required.", Toast.LENGTH_LONG).show();
                finish();
            }
        } else if (requestCode == 100) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingImagePath != null) {
                    saveToRoomAndSync(pendingImagePath);
                    pendingImagePath = null;
                }
            } else if (pendingImagePath != null) {
                finalizeComplaintSave(pendingImagePath, null, null);
                pendingImagePath = null;
            }
        }
    }
}
