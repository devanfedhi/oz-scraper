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

Start Postgres, Liquibase, the Restate server, the bundled Restate app image,
and the deployment registration job:

```sh
pnpm docker:start
```

## Database migrations

The database schema is managed automatically by Liquibase on Docker startup.
The root changelog is at
`liquibase/db.changelog.yaml`, with changesets stored in the
adjacent `changesets` directory.

`pnpm docker:start` runs Liquibase after Postgres becomes healthy, then starts
the Restate server and the single Restate app image that serves all workflows.
The `restate-register` service force-registers that bundled endpoint with the
local Restate server on every startup.

## Restate

Open [http://localhost:9070](http://localhost:9070) after the stack starts for
the Restate UI and admin surface. The HTTP ingress is available at
[http://localhost:8080](http://localhost:8080). The bundled workflow endpoint
itself listens on port `9080` inside the Compose network and is registered to
the server automatically.

The repository-managed Restate app lives in `packages/apps/restate`. Both the
`scraper` and `notifier` workflows are served from that one image.

Useful commands:

```sh
pnpm restate:health
pnpm restate:logs
pnpm docker:stop
```

`docker compose down -v` resets the Postgres data, Restate local state, and the
rest of the local stack.
