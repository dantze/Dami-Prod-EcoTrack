-- The order date columns become real DATE columns (TODO-105).
--
-- THIS MIGRATION IS VENDOR-SPLIT, and it is the first one that had to be.
-- V1 and V2 are portable because Hibernate's Postgres DDL happens to be valid
-- H2. Retyping varchar -> date is not: Postgres has no assignment cast from
-- varchar to date and refuses the ALTER without an explicit USING clause, while
-- H2 has no USING clause at all. So there is an h2/ copy of this file next to
-- this one, with the same version and description, and
-- `spring.flyway.locations` lists the shared folder plus the {vendor} one.
--
-- The two files must stay in step. They are checked independently - the suite
-- runs the H2 one, and the Postgres one was applied to a real Postgres 16
-- before this landed - because a difference between them is invisible until it
-- reaches the database that has the other copy.
--
-- The values already stored are ISO 'YYYY-MM-DD' text written by the web app's
-- date field, so the cast is lossless. A row holding anything else fails the
-- migration loudly, which is the right outcome: a date the database could not
-- read was never a date, and finding that out during a deploy beats finding it
-- out when a query silently sorts it as text.

ALTER TABLE amplasare_orders ALTER COLUMN start_date TYPE date USING NULLIF(start_date, '')::date;
ALTER TABLE amplasare_orders ALTER COLUMN end_date TYPE date USING NULLIF(end_date, '')::date;
ALTER TABLE ridicare_orders ALTER COLUMN pickup_date TYPE date USING NULLIF(pickup_date, '')::date;
ALTER TABLE igienizare_orders ALTER COLUMN sanitation_date TYPE date USING NULLIF(sanitation_date, '')::date;
