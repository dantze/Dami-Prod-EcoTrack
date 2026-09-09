package com.example.damiProd.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Gives every request an id, puts it in the logging MDC, and echoes it back on
 * the response (TODO-104).
 *
 * The backend scales to zero and runs several instances, so "the log line for
 * this failure" is a needle in a shared haystack: without a correlation id the
 * only way to tie a user's report to server logs is a timestamp and a guess.
 * With the structured logging configured in application-prod.properties, this
 * id becomes a queryable field on every line the request produced.
 *
 * <p>It runs at {@code HIGHEST_PRECEDENCE} so that the id is already in the MDC
 * when {@link BearerTokenAuthenticationFilter} rejects a token - authentication
 * failures are exactly the ones somebody later needs to find.
 *
 * <p>An inbound {@code X-Request-Id} is honoured rather than replaced, so a
 * value assigned upstream survives; it is length-capped and stripped of
 * anything but the characters an id can be made of, because it is written into
 * log lines and a header is caller-controlled input.
 *
 * <p>The MDC is cleared in a {@code finally}: the thread goes back to a pool,
 * and a leaked id would label the NEXT request with the previous one's - worse
 * than having no id at all, because it reads as evidence.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    private static final String MDC_KEY = "requestId";
    private static final int MAX_LENGTH = 64;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String id = sanitise(request.getHeader(HEADER));
        if (id == null) id = UUID.randomUUID().toString();

        MDC.put(MDC_KEY, id);
        response.setHeader(HEADER, id);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    /** Null unless the caller sent something that is safe to put in a log line. */
    private static String sanitise(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.length() > MAX_LENGTH ? raw.substring(0, MAX_LENGTH) : raw;
        return trimmed.matches("[A-Za-z0-9._:-]+") ? trimmed : null;
    }
}
