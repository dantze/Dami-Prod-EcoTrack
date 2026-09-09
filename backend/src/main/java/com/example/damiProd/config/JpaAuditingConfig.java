package com.example.damiProd.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Turns on the {@code @CreatedDate} / {@code @CreatedBy} handling that
 * {@link com.example.damiProd.domain.Auditable} declares (TODO-102).
 *
 * The auditor is an employee ID taken from the SecurityContext, which
 * BearerTokenAuthenticationFilter populates for every request carrying a valid
 * token - including while {@code ecotrack.security.enforce} is false, which is
 * why this works the same in both enforcement modes.
 *
 * <p>Returning {@code Optional.empty()} is a normal outcome, not a failure, and
 * there are two ways to reach it. The nightly Cloud Run Jobs run with no
 * authentication at all, so the tasks {@code RecurringTaskScheduler} generates
 * are genuinely authorless. And an anonymous caller through the public
 * enrollment endpoints writes rows that no employee owns yet. In both cases
 * {@code created_by} stays null, which is the honest answer; inventing a
 * placeholder employee id would put a lie in the one column that exists to say
 * who did it.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<Long> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return Optional.empty();
            if (auth.getPrincipal() instanceof EmployeePrincipal principal) {
                return Optional.ofNullable(principal.getEmployee()).map(e -> e.getId());
            }
            return Optional.empty();
        };
    }
}
