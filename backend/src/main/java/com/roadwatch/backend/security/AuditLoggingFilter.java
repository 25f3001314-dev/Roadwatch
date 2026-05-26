package com.roadwatch.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Lightweight request audit log. Logs method, path, status, duration,
 * remote IP, and user (if authenticated). Adds a request-id MDC tag so
 * downstream logs can be correlated.
 *
 * Skips static / actuator / swagger noise.
 */
@Component
@Order(1)
public class AuditLoggingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger("AUDIT");

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String path = req.getRequestURI();
        if (shouldSkip(path)) {
            chain.doFilter(req, res);
            return;
        }

        String reqId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", reqId);
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String user = req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "anonymous";
            logger.info("rid={} {} {} -> {} {}ms ip={} user={}",
                    reqId,
                    req.getMethod(),
                    path,
                    res.getStatus(),
                    duration,
                    clientIp(req),
                    user);
            MDC.remove("requestId");
        }
    }

    private boolean shouldSkip(String path) {
        return path == null
                || path.startsWith("/actuator")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api/images");
    }

    private String clientIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
