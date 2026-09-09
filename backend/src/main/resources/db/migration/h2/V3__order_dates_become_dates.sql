-- The order date columns become real DATE columns (TODO-105).
--
-- The H2 half of a vendor-split migration; the postgresql/ copy carries the
-- full explanation of why this one file exists twice. H2 casts varchar to date
-- implicitly on ALTER COLUMN and has no USING clause, so the statements differ
-- from the Postgres ones by exactly that.

ALTER TABLE amplasare_orders ALTER COLUMN start_date SET DATA TYPE date;
ALTER TABLE amplasare_orders ALTER COLUMN end_date SET DATA TYPE date;
ALTER TABLE ridicare_orders ALTER COLUMN pickup_date SET DATA TYPE date;
ALTER TABLE igienizare_orders ALTER COLUMN sanitation_date SET DATA TYPE date;
