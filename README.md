# Oz Scraper

Barebones TypeScript monorepo with shared database and domain-type packages.

## Structure

```text
packages/
  libs/
    db/
    types/
```

## Local Development

Install dependencies:

```sh
pnpm install
```

Run Postgres and apply the database migrations with Docker Compose:

```sh
pnpm docker:start
```

## Database migrations

The database schema is managed automatically by Liquibase on Docker startup.
The root changelog is at
`liquibase/db.changelog.yaml`, with changesets stored in the
adjacent `changesets` directory.

`pnpm docker:start` runs Liquibase after Postgres becomes healthy.
>>>>>>> 6ff0b79 (chore(setup): initialize TypeScript monorepo)
