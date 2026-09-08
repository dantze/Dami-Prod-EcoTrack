package com.example.damiProd.job;

import com.example.damiProd.scheduler.RecurringTaskScheduler;
import com.example.damiProd.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Runs one nightly job and exits, under the {@code job} profile.
 *
 * The two jobs used to be Spring {@code @Scheduled} methods, which needed a
 * container that was alive and holding CPU at 02:00 and so pinned Cloud Run at
 * one warm instance (TODO-80), and ran once per instance rather than once
 * (TODO-81). They are Cloud Run Jobs now: Cloud Scheduler starts one execution,
 * this runner does the work, and the exit code is what marks the execution
 * failed. Which job to run comes from {@code ECOTRACK_JOB}.
 */
@Component
@Profile("job")
public class JobRunner implements ApplicationRunner {

    public static final String GENERATE_TASKS = "generate-tasks";
    public static final String PRUNE_SESSIONS = "prune-sessions";

    public static final int SUCCESS = 0;
    public static final int FAILURE = 1;

    private static final Logger log = LoggerFactory.getLogger(JobRunner.class);

    private final ApplicationContext context;
    private final RecurringTaskScheduler recurringTaskScheduler;
    private final TokenService tokenService;
    private final String job;

    public JobRunner(ApplicationContext context,
                     RecurringTaskScheduler recurringTaskScheduler,
                     TokenService tokenService,
                     @Value("${ecotrack.job:}") String job) {
        this.context = context;
        this.recurringTaskScheduler = recurringTaskScheduler;
        this.tokenService = tokenService;
        this.job = job;
    }

    @Override
    public void run(ApplicationArguments args) {
        int code = execute(job);
        // Two halves, and both are needed: exit() closes the context so the
        // JVM stops rather than idling, System.exit carries the status Cloud
        // Run reads to decide whether the execution failed.
        SpringApplication.exit(context, () -> code);
        System.exit(code);
    }

    /**
     * Runs the named job and answers the process exit code. Separate from
     * {@link #run(ApplicationArguments)} so it can be exercised without ending
     * the JVM.
     */
    public int execute(String name) {
        if (name == null || name.isBlank()) {
            log.error("No job selected. Set ECOTRACK_JOB to one of: {}, {}", GENERATE_TASKS, PRUNE_SESSIONS);
            return FAILURE;
        }

        log.info("Starting job {}", name);
        try {
            switch (name) {
                case GENERATE_TASKS -> recurringTaskScheduler.generateUpcomingTasks();
                case PRUNE_SESSIONS -> tokenService.pruneStaleSessions();
                default -> {
                    log.error("Unknown job {}. Expected one of: {}, {}", name, GENERATE_TASKS, PRUNE_SESSIONS);
                    return FAILURE;
                }
            }
        } catch (Exception e) {
            log.error("Job {} failed", name, e);
            return FAILURE;
        }

        log.info("Job {} finished", name);
        return SUCCESS;
    }
}
