# monorepo

![API CI](https://github.com/grabreu/monorepo/actions/workflows/api-ci.yml/badge.svg)
![Web CI](https://github.com/grabreu/monorepo/actions/workflows/web-ci.yml/badge.svg)
[![Quality Gate - API](https://sonarcloud.io/api/project_badges/measure?project=grabreu_monorepo_api&metric=alert_status)](https://sonarcloud.io/dashboard?id=grabreu_monorepo_api)
[![Quality Gate - Web](https://sonarcloud.io/api/project_badges/measure?project=grabreu_monorepo_web&metric=alert_status)](https://sonarcloud.io/dashboard?id=grabreu_monorepo_web)

Explore and validate a .NET + React monorepo foundation — repo structure, CI/CD, and GitHub conventions — using ASP.NET Core, Vite, and TanStack Router.

## Apps

- [`apps/api`](apps/api) — ASP.NET Core, deployed to Azure Container Apps
- [`apps/web`](apps/web) — Vite + React + TanStack Router, deployed to Azure Static Web Apps

## Docs

- [`docs/adr/`](docs/adr) — architecture decisions
- [`docs/infra/`](docs/infra) — Azure infra setup (shared resources + per-app steps)
