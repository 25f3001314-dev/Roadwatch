package com.roadwatch.mobile.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.roadwatch.mobile.R;
import com.roadwatch.mobile.auth.FirebaseAuthManager;
import com.roadwatch.mobile.firebase.FirestoreManager;
import com.roadwatch.mobile.auth.SessionManager;
import com.google.firebase.auth.FirebaseUser;

public class SignupActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        EditText etFullName = findViewById(R.id.etFullName);
        EditText etEmail = findViewById(R.id.etEmail);
        EditText etPassword = findViewById(R.id.etPassword);
        EditText etConfirmPassword = findViewById(R.id.etConfirmPassword);
        MaterialButton btnSignUp = findViewById(R.id.btnSignUp);
        TextView tvLogin = findViewById(R.id.tvLogin);

        FirebaseAuthManager authManager = new FirebaseAuthManager();
        FirestoreManager firestore = new FirestoreManager();
        SessionManager sessionManager = new SessionManager(this);

        btnSignUp.setOnClickListener(v -> {
            String fullName = etFullName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString();
            String confirmPassword = etConfirmPassword.getText().toString();

            if (email.isEmpty()) {
                Toast.makeText(this, "Email cannot be empty", Toast.LENGTH_SHORT).show();
                return;
            }
            if (password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please enter and confirm your password", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!password.equals(confirmPassword)) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show();
                return;
            }

            btnSignUp.setEnabled(false);
            authManager.signUp(fullName, email, password, new FirebaseAuthManager.AuthCallback() {
                @Override
                public void onSuccess() {
                    FirebaseUser user = authManager.getCurrentUser();
                    if (user != null) {
                        String uid = user.getUid();
                        // Save profile to Firestore
                        firestore.saveUserProfile(uid, fullName, email);
                        // Mark local session so existing flows continue to work
                        sessionManager.saveSession("firebase:" + uid, email);
                        runOnUiThread(() -> {
                            Toast.makeText(SignupActivity.this, "Account Created!", Toast.LENGTH_LONG).show();
                            startActivity(new Intent(SignupActivity.this, com.roadwatch.mobile.ui.dashboard.MainActivity.class));
                            finish();
                        });
                    } else {
                        runOnUiThread(() -> {
                            btnSignUp.setEnabled(true);
                            Toast.makeText(SignupActivity.this, "Sign up failed: user object null", Toast.LENGTH_LONG).show();
                        });
                    }
                }

                @Override
                public void onFailure(String error) {
                    runOnUiThread(() -> {
                        btnSignUp.setEnabled(true);
                        Toast.makeText(SignupActivity.this, "Sign up failed: " + error, Toast.LENGTH_LONG).show();
                    });
                }
            });
        });

        tvLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }
}
