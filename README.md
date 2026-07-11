# Oz Scraper

Barebones TypeScript monorepo with shared database and domain-type packages,
plus a local Restate environment for developing scraper and notifier workflows.

## Structure

```text
packages/
  apps/
    restate/
  libs/
    db/
    types/
```

## Local Development

Install dependencies:

```sh
pnpm install
```

Enable the repo-managed Git hooks:

```sh
git config core.hooksPath .githooks
```

There are two supported local-dev flows.

### Option 1: Full Docker stack

Start Postgres, Liquibase, the Restate server, the bundled Restate app image,
and the deployment registration job:

```sh
pnpm docker:start
```

Use this when you want everything to run inside Docker, including the Restate
app.

### Option 2: Docker infra + local Restate app

Start only the shared infrastructure in Docker:

```sh
pnpm docker:infra
```

Then start the Restate app locally:

```sh
pnpm restate:dev
```

Use this when you want faster iteration on `packages/apps/restate` without
rebuilding the Docker app image on every change.

## Database migrations

The database schema is managed automatically by Liquibase on Docker startup.
The root changelog is at
`liquibase/db.changelog.yaml`, with changesets stored in the
adjacent `changesets` directory.

`pnpm docker:start` runs Liquibase after Postgres becomes healthy, then starts
the Restate server and the single Restate app image that serves all workflows.
The `restate-register` service force-registers that bundled endpoint with the
local Restate server on every startup.

`pnpm docker:infra` runs only `db`, `liquibase`, and `restate-server`. That is
the intended base for `pnpm restate:dev`.

## Restate

Open [http://localhost:9070](http://localhost:9070) after the stack starts for
the Restate UI and admin surface. The HTTP ingress is available at
[http://localhost:8080](http://localhost:8080). The bundled workflow endpoint
itself listens on port `9080` inside the Compose network and is registered to
the server automatically.

The repository-managed Restate app lives in `packages/apps/restate`. Both the
`scraper` and `notifier` workflows are served from that one image.

`pnpm restate:dev` does three things:

1. builds `@oz-scraper/restate`
2. starts it locally with `OZ_SCRAPER_DATABASE_URL=postgres://oz:oz@localhost:5432/oz_scraper?sslmode=disable`
3. registers `http://host.docker.internal:9080` against the Dockerized Restate server

That means the recommended local iteration loop is:

```sh
pnpm docker:infra
pnpm restate:dev
```

Useful commands:

```sh
pnpm docker:infra
pnpm restate:dev
pnpm restate:health
pnpm restate:logs
pnpm docker:stop
```

`docker compose down -v` resets the Postgres data, Restate local state, and the
rest of the local stack.
