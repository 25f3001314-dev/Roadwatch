package com.roadwatch.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lightweight per-IP token-bucket rate limiter for write endpoints.
 *
 * Defaults: 60 writes / minute per IP. Tunable via roadwatch.security.rate-limit.*.
 *
 * For multi-instance deployments, swap this for a Redis-backed limiter
 * (e.g. Bucket4j) — this in-memory implementation is per-process.
 */
@Component
@Order(2)
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${roadwatch.security.rate-limit.writes-per-minute:60}")
    private int writesPerMinute;

    @Value("${roadwatch.security.rate-limit.enabled:true}")
    private boolean enabled;

    private static class Bucket {
        final AtomicInteger count = new AtomicInteger();
        volatile long windowStart = System.currentTimeMillis();
    }

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        if (!enabled || !isWrite(req) || shouldSkip(req)) {
            chain.doFilter(req, res);
            return;
        }

        String ip = clientIp(req);
        Bucket b = buckets.computeIfAbsent(ip, k -> new Bucket());
        long now = System.currentTimeMillis();
        if (now - b.windowStart > 60_000) {
            synchronized (b) {
                if (now - b.windowStart > 60_000) {
                    b.count.set(0);
                    b.windowStart = now;
                }
            }
        }
        int n = b.count.incrementAndGet();
        if (n > writesPerMinute) {
            res.setStatus(429);
            res.setHeader("Retry-After", "60");
            res.setContentType("application/json");
            res.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded\"}");
            return;
        }
        chain.doFilter(req, res);
    }

    private boolean isWrite(HttpServletRequest req) {
        String m = req.getMethod();
        return "POST".equalsIgnoreCase(m) || "PUT".equalsIgnoreCase(m)
                || "PATCH".equalsIgnoreCase(m) || "DELETE".equalsIgnoreCase(m);
    }

    private boolean shouldSkip(HttpServletRequest req) {
        String p = req.getRequestURI();
        // Don't rate-limit health/auth/login or governance refresh (admin-only triggered).
        return p.startsWith("/actuator")
                || p.startsWith("/api/auth/")
                || p.startsWith("/v3/api-docs")
                || p.startsWith("/swagger-ui");
    }

    private String clientIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
