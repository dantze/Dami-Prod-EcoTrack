-- Indexes on the columns the app actually filters by (TODO-106).
--
-- Postgres does NOT create an index for a foreign key constraint - only for a
-- PRIMARY KEY or a UNIQUE - and neither does H2. Until this migration the whole
-- schema had exactly two indexes, both on access_requests, while the
-- repositories are almost entirely foreign-key lookups: findByRoute (five of
-- them), findByClientId, findByTaskId, findBySubscription, findByRecurringPlan,
-- findByEmployeeId. Every one of those was a sequential scan of the whole
-- table, and the cost grows with the table rather than with the answer - so it
-- is invisible on a developer's H2 file with forty rows and becomes the whole
-- response time on a real season of orders.
--
-- Deletes benefit as much as reads: Postgres checks every referencing table
-- before removing a parent row, and an unindexed child means a full scan per
-- delete.
--
-- Only columns something actually queries are indexed. An index is not free -
-- it is written on every insert and update - so this is the repository's
-- current query set, not every foreign key in the schema.

-- Tasks: the dispatch board (by route), the driver's day (by route + date), the
-- Curente/Arhiva split (by order) and the nightly top-up (by recurring plan).
CREATE INDEX idx_task_route ON tasks (route_id);
CREATE INDEX idx_task_order ON tasks (order_id);
CREATE INDEX idx_task_recurring_plan ON tasks (recurring_plan_id);
CREATE INDEX idx_task_status ON tasks (status);
-- Composite for findByRouteAndDay: route first, because it is the equality
-- half and a composite index can only be used left-to-right.
CREATE INDEX idx_task_route_scheduled_date ON tasks (route_id, scheduled_date);

-- Photos are always fetched for one task.
CREATE INDEX idx_task_photo_task ON task_photos (task_id);

-- Orders: every order list is scoped to a client, and the subtype tables are
-- what findLiveByProductId / findLiveBySubscriptionId join through.
CREATE INDEX idx_order_client ON orders (client_id);
CREATE INDEX idx_amplasare_product ON amplasare_orders (product_id);
CREATE INDEX idx_ridicare_product ON ridicare_orders (product_id);
CREATE INDEX idx_igienizare_subscription ON igienizare_orders (subscription_id);
CREATE INDEX idx_igienizare_recurring_plan ON igienizare_orders (recurring_plan_id);

-- Routes belong to one driver; the driver's own screens start here.
CREATE INDEX idx_route_employee ON routes (employee_id);

-- Recurring plans: listed by client, by route, and by the active flag that the
-- nightly generator and the "unassigned" list both filter on.
CREATE INDEX idx_recurring_client ON recurring_igienizari (client_id);
CREATE INDEX idx_recurring_route ON recurring_igienizari (route_id);
CREATE INDEX idx_recurring_subscription ON recurring_igienizari (subscription_id);
CREATE INDEX idx_recurring_active ON recurring_igienizari (active);

-- Sessions: every authenticated request resolves a token, and the session list
-- and the nightly prune both work per employee. The two token-hash columns are
-- already UNIQUE and therefore already indexed - not repeated here.
CREATE INDEX idx_session_employee ON sessions (employee_id);
CREATE INDEX idx_session_expires_at ON sessions (expires_at);

-- The join table's PRIMARY KEY is (employee_id, role_id), which already serves
-- lookups by employee. Counting employees per role reads the other column, and
-- a composite index cannot be used right-to-left.
CREATE INDEX idx_employee_role_role ON employees_roles_join (role_id);
