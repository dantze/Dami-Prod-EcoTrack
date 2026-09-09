package com.example.damiProd.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Who last touched this row, when, and a version to catch two people touching
 * it at once (TODO-102, TODO-103).
 *
 * Carried by the business entities that people edit - Order, Task, Client,
 * Route, Product, Subscription, RecurringIgienizare. Deliberately NOT carried by
 * Session or AccessRequest: those already have their own purpose-built
 * timestamps, and their "who" is the point of the row rather than metadata on
 * it.
 *
 * <p><b>The audit half.</b> Before this, no business row recorded when it was
 * created or who changed it. The app's whole shape makes that a real gap: a
 * driver sets a task's status from a phone, in the field, and the photo proving
 * the work is stored against the task - but nothing recorded which employee
 * moved it to COMPLETED, or when. {@code createdBy} / {@code updatedBy} hold an
 * employee id rather than a name, because a name is a copy that goes stale and
 * the employee row outlives the edit. They are nullable on purpose: the nightly
 * Cloud Run Jobs write tasks with nobody logged in, and a job's writes are
 * honestly authorless rather than attributable to whoever deployed it.
 *
 * <p><b>The locking half.</b> {@code @Version} makes a concurrent edit fail
 * instead of silently winning. That matters here more than the usual amount,
 * because Spring Data {@code save()} issues a FULL-ROW update: two dispatchers
 * with the same task open did not merely race on one field, the second one to
 * press Salvează wrote back every stale field it was holding and erased the
 * first one's other changes with no error on either screen. Hibernate now adds
 * {@code AND version = ?} to that update, and
 * {@code ObjectOptimisticLockingFailureException} becomes a 409 with a Romanian
 * message the operator can act on - see GlobalExceptionHandler.
 *
 * <p>The column defaults to 0 in the V2 migration so rows written before this
 * existed start somewhere valid.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class Auditable {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    /** Employee id, not a name - see the class comment. Null for job writes. */
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private Long createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private Long updatedBy;

    /**
     * Not settable by a client. Jackson would otherwise accept a version off the
     * wire on the PUT bodies that bind straight to an entity, and a caller that
     * sends a stale one turns a safe refusal into a lost update - the exact bug
     * this field exists to prevent.
     */
    @Version
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    @Column(name = "version", nullable = false)
    private Long version;
}
