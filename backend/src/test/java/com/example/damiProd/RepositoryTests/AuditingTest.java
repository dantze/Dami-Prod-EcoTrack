package com.example.damiProd.RepositoryTests;

import com.example.damiProd.config.EmployeePrincipal;
import com.example.damiProd.config.JpaAuditingConfig;
import com.example.damiProd.domain.Employee;
import com.example.damiProd.domain.Task;
import com.example.damiProd.domain.TaskStatus;
import com.example.damiProd.domain.TaskType;
import com.example.damiProd.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The audit trail actually records who and when (TODO-102).
 *
 * Worth a test of its own because the failure mode is silent: the columns exist
 * and every row still saves whether or not the listener is wired, so a broken
 * {@code @EnableJpaAuditing} would show up only as a table of nulls nobody looks
 * at until the day they need it. The question this answers is the one the app
 * could not answer before - "which employee moved this task to COMPLETED".
 */
@DataJpaTest
@Import(JpaAuditingConfig.class)
class AuditingTest {

    @Autowired private TaskRepository taskRepository;
    @Autowired private TestEntityManager em;

    @AfterEach
    void clearAuth() {
        SecurityContextHolder.clearContext();
    }

    private void signedInAs(long employeeId) {
        Employee employee = new Employee();
        employee.setId(employeeId);
        EmployeePrincipal principal = new EmployeePrincipal(employee, 1L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, List.of()));
    }

    private Task newTask() {
        Task task = new Task();
        task.setType(TaskType.PLACEMENT);
        task.setStatus(TaskStatus.NEW);
        return task;
    }

    @Test
    @DisplayName("a write by a signed-in employee records that employee and the time")
    void recordsAuthorAndTimestampOnCreate() {
        signedInAs(42L);

        Task saved = taskRepository.save(newTask());
        em.flush();

        assertThat(saved.getCreatedAt()).as("created_at").isNotNull();
        assertThat(saved.getUpdatedAt()).as("updated_at").isNotNull();
        assertThat(saved.getCreatedBy()).as("the employee id, not a name").isEqualTo(42L);
        assertThat(saved.getUpdatedBy()).isEqualTo(42L);
        assertThat(saved.getVersion()).as("a fresh row starts at version 0").isZero();
    }

    @Test
    @DisplayName("a later edit by someone else records the SECOND employee, and keeps the first as author")
    void recordsTheEditorSeparatelyFromTheAuthor() {
        signedInAs(42L);
        Task saved = taskRepository.save(newTask());
        em.flush();
        em.clear();

        // The driver who actually completes the task is not the dispatcher who
        // created it, and that difference is the entire point of the column.
        signedInAs(7L);
        Task reloaded = taskRepository.findById(saved.getId()).orElseThrow();
        reloaded.setStatus(TaskStatus.COMPLETED);
        taskRepository.save(reloaded);
        em.flush();
        em.clear();

        Task after = taskRepository.findById(saved.getId()).orElseThrow();
        assertThat(after.getCreatedBy()).as("author is immutable").isEqualTo(42L);
        assertThat(after.getUpdatedBy()).as("who completed it").isEqualTo(7L);
        assertThat(after.getVersion()).as("an edit bumps the version").isEqualTo(1L);
    }

    @Test
    @DisplayName("a write with nobody authenticated is authorless rather than attributed to a placeholder")
    void jobWritesHaveNoAuthor() {
        // The nightly Cloud Run Jobs run with no SecurityContext at all. A null
        // here is the honest answer; inventing an employee id would put a lie in
        // the one column that exists to say who did it.
        SecurityContextHolder.clearContext();

        Task saved = taskRepository.save(newTask());
        em.flush();

        assertThat(saved.getCreatedBy()).isNull();
        assertThat(saved.getUpdatedBy()).isNull();
        assertThat(saved.getCreatedAt()).as("the WHEN is still recorded").isNotNull();
    }
}
