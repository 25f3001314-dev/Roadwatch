package com.roadwatch.mobile.network;

import android.content.Context;
import android.util.Log;

import com.roadwatch.mobile.auth.SessionManager;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Attaches the saved JWT to every outbound request, except the public
 * {@code /auth/login} endpoint which the backend explicitly permits unauthenticated.
 */
public class AuthInterceptor implements Interceptor {

    private static final String TAG = "AuthInterceptor";

    private final SessionManager sessionManager;

    public AuthInterceptor(Context context) {
        sessionManager = new SessionManager(context);
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original = chain.request();

        String path = original.url().encodedPath();
        // Backend's SecurityConfig permits /api/auth/login + /api/complaints (POST)
        // unauthenticated — don't waste bandwidth attaching a stale token there.
        if (path.contains("/auth/login")) {
            return chain.proceed(original);
        }

        String token = sessionManager.getToken();
        if (token == null || token.isEmpty()) {
            Log.w(TAG, "No bearer token for " + original.method() + " " + path);
            return chain.proceed(original);
        }
        Request authed = original.newBuilder()
                .header("Authorization", "Bearer " + token)
                .build();
        return chain.proceed(authed);
    }
}
