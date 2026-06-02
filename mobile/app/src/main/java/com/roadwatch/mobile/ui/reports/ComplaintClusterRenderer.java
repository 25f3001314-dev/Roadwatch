package com.roadwatch.mobile.ui.reports;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;

import androidx.annotation.DrawableRes;
import androidx.core.content.ContextCompat;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.maps.android.clustering.Cluster;
import com.google.maps.android.clustering.ClusterManager;
import com.google.maps.android.clustering.view.DefaultClusterRenderer;
import com.roadwatch.mobile.R;

/**
 * Renders {@link ComplaintClusterItem}s as red/yellow/green pins
 * and groups dense markers into clusters automatically.
 *
 * Cluster threshold: more than 4 items in proximity collapses into a
 * single circular cluster marker, preserving readability when many
 * potholes are reported in the same neighbourhood.
 */
public class ComplaintClusterRenderer extends DefaultClusterRenderer<ComplaintClusterItem> {

    private static final int CLUSTER_THRESHOLD = 4;

    private final BitmapDescriptor redIcon;
    private final BitmapDescriptor yellowIcon;
    private final BitmapDescriptor greenIcon;

    public ComplaintClusterRenderer(Context context, GoogleMap map,
                                    ClusterManager<ComplaintClusterItem> clusterManager) {
        super(context, map, clusterManager);
        this.redIcon    = bitmapFromVector(context, R.drawable.marker_red);
        this.yellowIcon = bitmapFromVector(context, R.drawable.marker_yellow);
        this.greenIcon  = bitmapFromVector(context, R.drawable.marker_green);
    }

    @Override
    protected void onBeforeClusterItemRendered(ComplaintClusterItem item,
                                               MarkerOptions markerOptions) {
        markerOptions.icon(iconFor(item.getBucket()));
        markerOptions.title(item.getTitle());
        markerOptions.snippet(item.getSnippet());
        markerOptions.anchor(0.5f, 1.0f); // pin tip on the coordinate
    }

    @Override
    protected boolean shouldRenderAsCluster(Cluster<ComplaintClusterItem> cluster) {
        return cluster.getSize() > CLUSTER_THRESHOLD;
    }

    private BitmapDescriptor iconFor(int bucket) {
        switch (bucket) {
            case ComplaintClusterItem.BUCKET_RESOLVED:    return greenIcon;
            case ComplaintClusterItem.BUCKET_IN_PROGRESS: return yellowIcon;
            case ComplaintClusterItem.BUCKET_PENDING:
            default:                                       return redIcon;
        }
    }

    private static BitmapDescriptor bitmapFromVector(Context context,
                                                     @DrawableRes int vectorRes) {
        Drawable drawable = ContextCompat.getDrawable(context, vectorRes);
        if (drawable == null) {
            return BitmapDescriptorFactory.defaultMarker();
        }
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
}
