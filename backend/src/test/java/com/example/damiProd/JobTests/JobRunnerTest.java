package com.example.damiProd.JobTests;

import com.example.damiProd.job.JobRunner;
import com.example.damiProd.scheduler.RecurringTaskScheduler;
import com.example.damiProd.service.TokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * The nightly jobs are one process per execution now (TODO-80/81), so the exit
 * code is the only thing Cloud Run reads to decide whether the night's work
 * happened. {@code execute} is tested rather than {@code run} because the
 * latter ends the JVM.
 */
@ExtendWith(MockitoExtension.class)
class JobRunnerTest {

    @Mock private ApplicationContext context;
    @Mock private RecurringTaskScheduler recurringTaskScheduler;
    @Mock private TokenService tokenService;

    private JobRunner runner(String job) {
        return new JobRunner(context, recurringTaskScheduler, tokenService, job);
    }

    @Test
    void generateTasks_runsOnlyTheGenerator() {
        assertThat(runner("generate-tasks").execute("generate-tasks")).isZero();

        verify(recurringTaskScheduler).generateUpcomingTasks();
        verify(tokenService, never()).pruneStaleSessions();
    }

    @Test
    void pruneSessions_runsOnlyThePrune() {
        assertThat(runner("prune-sessions").execute("prune-sessions")).isZero();

        verify(tokenService).pruneStaleSessions();
        verify(recurringTaskScheduler, never()).generateUpcomingTasks();
    }

    @Test
    void unknownJobName_failsAndRunsNothing() {
        assertThat(runner("tidy-up").execute("tidy-up")).isEqualTo(1);

        verify(recurringTaskScheduler, never()).generateUpcomingTasks();
        verify(tokenService, never()).pruneStaleSessions();
    }

    @Test
    void missingJobName_fails() {
        // An unset ECOTRACK_JOB must not quietly succeed: a green execution
        // that did nothing is indistinguishable from the work being done.
        assertThat(runner("").execute("")).isEqualTo(1);
        assertThat(runner(null).execute(null)).isEqualTo(1);

        verify(recurringTaskScheduler, never()).generateUpcomingTasks();
        verify(tokenService, never()).pruneStaleSessions();
    }

    @Test
    void aThrowingJob_fails() {
        doThrow(new IllegalStateException("boom")).when(recurringTaskScheduler).generateUpcomingTasks();

        assertThat(runner("generate-tasks").execute("generate-tasks")).isEqualTo(1);
    }
}
