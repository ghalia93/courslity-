/*
  Official catalog corrections are applied through the admin roadmap/catalog
  flows. This file intentionally remains idempotent so npm run seed:official
  never fails when no pending correction batch is present.
*/

SELECT 1 AS official_catalog_corrections_ready;
