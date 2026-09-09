-- Audit columns and a version column on the entities people edit
-- (TODO-102, TODO-103). See domain/Auditable.java for why each exists.
--
-- `version` is NOT NULL DEFAULT 0 so the rows that predate this migration start
-- at a valid version rather than at null, which Hibernate would read as "this
-- row is new" and try to INSERT. The default stays on the column afterwards: it
-- costs nothing and it keeps any hand-written INSERT (a fixture, a repair
-- script) from reintroducing the same null.
--
-- The audit columns are all nullable, and they stay nullable. Rows written
-- before today have no honest value for them, and the nightly jobs write rows
-- with nobody authenticated - see the AuditorAware in config/JpaAuditingConfig.

ALTER TABLE orders ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE orders ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE orders ADD COLUMN created_by bigint;
ALTER TABLE orders ADD COLUMN updated_by bigint;
ALTER TABLE orders ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE tasks ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE tasks ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE tasks ADD COLUMN created_by bigint;
ALTER TABLE tasks ADD COLUMN updated_by bigint;
ALTER TABLE tasks ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE client ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE client ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE client ADD COLUMN created_by bigint;
ALTER TABLE client ADD COLUMN updated_by bigint;
ALTER TABLE client ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE routes ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE routes ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE routes ADD COLUMN created_by bigint;
ALTER TABLE routes ADD COLUMN updated_by bigint;
ALTER TABLE routes ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE products ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE products ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE products ADD COLUMN created_by bigint;
ALTER TABLE products ADD COLUMN updated_by bigint;
ALTER TABLE products ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE subscriptions ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE subscriptions ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE subscriptions ADD COLUMN created_by bigint;
ALTER TABLE subscriptions ADD COLUMN updated_by bigint;
ALTER TABLE subscriptions ADD COLUMN version bigint DEFAULT 0 NOT NULL;

ALTER TABLE recurring_igienizari ADD COLUMN created_at timestamp(6) with time zone;
ALTER TABLE recurring_igienizari ADD COLUMN updated_at timestamp(6) with time zone;
ALTER TABLE recurring_igienizari ADD COLUMN created_by bigint;
ALTER TABLE recurring_igienizari ADD COLUMN updated_by bigint;
ALTER TABLE recurring_igienizari ADD COLUMN version bigint DEFAULT 0 NOT NULL;

-- The audit trail's first question is "what happened to this task recently",
-- and it is asked across all tasks rather than within one route.
CREATE INDEX idx_task_updated_at ON tasks (updated_at);
