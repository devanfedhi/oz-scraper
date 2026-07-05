FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY liquibase ./liquibase
COPY packages ./packages

RUN pnpm install --no-frozen-lockfile
RUN pnpm build

CMD ["pnpm", "--filter", "@oz-scraper/restate", "start"]
