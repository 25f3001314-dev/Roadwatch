package com.roadwatch.mobile.ui.reports;

import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Marker;
import com.roadwatch.mobile.R;
import com.roadwatch.mobile.network.dto.ReportDto;

import java.util.Map;

/**
 * Renders the photo + road type + status mini-card when a marker is tapped.
 *
 * Uses {@link #getInfoContents} (not {@code getInfoWindow}) so the default
 * Maps-rendered shadow/anchor still wraps our custom layout.
 */
public class ComplaintInfoWindowAdapter implements GoogleMap.InfoWindowAdapter {

    private final Context context;
    private final View contentView;
    private final Map<Marker, ReportDto> markerLookup;

    private final ImageView ivThumb;
    private final TextView tvRoadType;
    private final TextView tvStatus;

    public ComplaintInfoWindowAdapter(Context context, Map<Marker, ReportDto> markerLookup) {
        this.context = context.getApplicationContext();
        this.markerLookup = markerLookup;
        this.contentView = LayoutInflater.from(context)
                .inflate(R.layout.map_info_window, null);
        this.ivThumb = contentView.findViewById(R.id.ivInfoThumb);
        this.tvRoadType = contentView.findViewById(R.id.tvInfoRoadType);
        this.tvStatus = contentView.findViewById(R.id.tvInfoStatus);
    }

    @Override
    public View getInfoWindow(Marker marker) {
        return null; // use default frame
    }

    @Override
    public View getInfoContents(Marker marker) {
        ReportDto report = markerLookup.get(marker);
        if (report == null) return null;

        tvRoadType.setText(TextUtils.isEmpty(report.roadType) ? "Road" : report.roadType);

        String status = TextUtils.isEmpty(report.status) ? "PENDING" : report.status;
        tvStatus.setText(status);
        tvStatus.setTextColor(ContextCompat.getColor(context, statusColorRes(status)));

        // Glide can't reliably populate the InfoWindow on the same render pass —
        // we set a placeholder, then re-show the window once the bitmap loads.
        ivThumb.setImageResource(R.drawable.ic_camera);
        if (!TextUtils.isEmpty(report.imageUrl)) {
            loadThumbnail(report.imageUrl, marker);
        }
        return contentView;
    }

    private void loadThumbnail(String url, Marker marker) {
        Glide.with(context)
                .asBitmap()
                .load(url)
                .apply(new RequestOptions()
                        .placeholder(R.drawable.ic_camera)
                        .error(R.drawable.ic_camera)
                        .override(192, 192)
                        .centerCrop())
                .into(new com.bumptech.glide.request.target.CustomTarget<android.graphics.Bitmap>() {
                    @Override
                    public void onResourceReady(android.graphics.Bitmap resource,
                                                com.bumptech.glide.request.transition.Transition<? super android.graphics.Bitmap> transition) {
                        ivThumb.setImageBitmap(resource);
                        if (marker.isInfoWindowShown()) {
                            marker.showInfoWindow();
                        }
                    }
                    @Override
                    public void onLoadCleared(android.graphics.drawable.Drawable placeholder) {
                        ivThumb.setImageResource(R.drawable.ic_camera);
                    }
                });
    }

    private int statusColorRes(String status) {
        String s = status.toUpperCase();
        if (s.equals("RESOLVED") || s.equals("FIXED") || s.equals("CLOSED")) {
            return R.color.mint_green;
        }
        if (s.equals("IN_PROGRESS") || s.equals("ASSIGNED") || s.equals("UNDER_REPAIR")) {
            return android.R.color.holo_orange_light;
        }
        return R.color.coral_red;
    }
}
