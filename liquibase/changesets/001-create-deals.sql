--liquibase formatted sql

--changeset oz-scraper:001-create-deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT deals_external_id_unique UNIQUE (external_id)
);

CREATE INDEX IF NOT EXISTS deals_external_id_idx ON deals (external_id);

--rollback DROP TABLE deals;
