package com.roadwatch.mobile.ui.notifications;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.roadwatch.mobile.R;
import com.roadwatch.mobile.data.AppDatabase;
import com.roadwatch.mobile.data.NotificationDao;
import com.roadwatch.mobile.data.NotificationEntity;
import com.roadwatch.mobile.ui.BaseActivity;
import com.roadwatch.mobile.ui.complaints.ComplaintDetailActivity;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * In-app inbox of all push notifications received. Tapping an item:
 *  - marks it read,
 *  - opens the complaint detail page if a {@code complaintId} is present,
 *  - otherwise just clears the unread state.
 *
 * Top-right menu offers "Mark all read" and "Clear all" so users can
 * tame the badge without opening every entry.
 */
public class NotificationInboxActivity extends BaseActivity {

    private static final String TAG = "NotificationInbox";

    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();

    private NotificationAdapter adapter;
    private NotificationDao dao;
    private LinearLayout emptyState;
    private RecyclerView rv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_inbox);
        setupToolbar("Notifications");

        emptyState = findViewById(R.id.emptyState);
        rv = findViewById(R.id.rvNotifications);

        adapter = new NotificationAdapter(this::onNotificationClicked);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);

        dao = AppDatabase.getDatabase(this).notificationDao();
        dao.observeAll().observe(this, list -> {
            adapter.submit(list);
            boolean empty = list == null || list.isEmpty();
            emptyState.setVisibility(empty ? View.VISIBLE : View.GONE);
            rv.setVisibility(empty ? View.GONE : View.VISIBLE);
        });
    }

    private void onNotificationClicked(NotificationEntity item) {
        Log.i(TAG, "Notification tapped id=" + item.id
                + " complaintId=" + item.complaintId);

        // Mark read off the main thread.
        if (!item.read) {
            dbExecutor.execute(() -> dao.markRead(item.id));
        }

        if (item.complaintId != null) {
            Intent intent = new Intent(this, ComplaintDetailActivity.class);
            intent.putExtra(ComplaintDetailActivity.EXTRA_COMPLAINT_ID, item.complaintId);
            startActivity(intent);
        }
    }

    // ─────────── Menu ───────────

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_inbox, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_mark_all_read) {
            dbExecutor.execute(() -> dao.markAllRead());
            return true;
        }
        if (id == R.id.action_clear_inbox) {
            new AlertDialog.Builder(this)
                    .setTitle("Clear all notifications?")
                    .setMessage("This removes the entire inbox history. The unread badge will reset to zero.")
                    .setPositiveButton("Clear", (d, w) -> dbExecutor.execute(() -> dao.clearAll()))
                    .setNegativeButton("Cancel", null)
                    .show();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        dbExecutor.shutdown();
    }
}
