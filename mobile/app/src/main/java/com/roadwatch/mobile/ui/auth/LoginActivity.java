package com.roadwatch.mobile.ui.auth;
import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.roadwatch.mobile.R;
import com.roadwatch.mobile.auth.LocalUserManager;
import com.roadwatch.mobile.auth.SessionManager;
import com.roadwatch.mobile.auth.FirebaseAuthManager;
import com.roadwatch.mobile.network.ApiClient;
import com.roadwatch.mobile.network.ApiService;
import com.roadwatch.mobile.network.dto.LoginRequest;
import com.roadwatch.mobile.network.dto.LoginResponse;
import com.google.firebase.auth.FirebaseUser;
import com.roadwatch.mobile.ui.dashboard.MainActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
public class LoginActivity extends AppCompatActivity {
    private SessionManager sessionManager;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        sessionManager = new SessionManager(this);
        if (sessionManager.isLoggedIn()) {
            openDashboard();
            return;
        }
        setContentView(R.layout.activity_login);
        EditText etEmail = findViewById(R.id.etEmail);
        EditText etPassword = findViewById(R.id.etPassword);
        MaterialButton btnLogin = findViewById(R.id.btnLogin);
        TextView tvRegister = findViewById(R.id.tvRegister);
        FirebaseAuthManager authManager = new FirebaseAuthManager();
        btnLogin.setOnClickListener(v -> {
            String username = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString();
            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }
            btnLogin.setEnabled(false);
            String backendUsername = "admin@roadwatch.com".equals(username) ? "admin" : username;
            ApiService api = ApiClient.getUnauthenticatedClient(this).create(ApiService.class);
            api.login(new LoginRequest(backendUsername, password)).enqueue(new Callback<LoginResponse>() {
                @Override
                public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        String token = response.body().getToken();
                        sessionManager.saveSession(token, username, response.body().getExpiresIn());
                        runOnUiThread(() -> openDashboard());
                        return;
                    }
                    tryFirebase(authManager, username, password, btnLogin);
                }
                @Override
                public void onFailure(Call<LoginResponse> call, Throwable t) {
                    tryFirebase(authManager, username, password, btnLogin);
                }
            });
        });
        tvRegister.setOnClickListener(v -> startActivity(new Intent(this, SignupActivity.class)));
    }
    private void tryFirebase(FirebaseAuthManager authManager, String username, String password, MaterialButton btnLogin) {
        authManager.login(username, password, new FirebaseAuthManager.AuthCallback() {
            @Override
            public void onSuccess() {
                FirebaseUser user = authManager.getCurrentUser();
                if (user != null) {
                    sessionManager.saveSession("firebase:" + user.getUid(), username);
                    runOnUiThread(() -> openDashboard());
                } else {
                    runOnUiThread(() -> {
                        btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this, "Login failed", Toast.LENGTH_LONG).show();
                    });
                }
            }
            @Override
            public void onFailure(String error) {
                boolean isLocal = new LocalUserManager(LoginActivity.this).validateUser(username, password);
                if (isLocal) {
                    sessionManager.saveSession("local_user_token", username);
                    runOnUiThread(() -> openDashboard());
                } else {
                    runOnUiThread(() -> {
                        btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this, "Invalid username or password", Toast.LENGTH_LONG).show();
                    });
                }
            }
        });
    }
    private void openDashboard() {
        startActivity(new Intent(this, MainActivity.class));
        finish();
    }
}