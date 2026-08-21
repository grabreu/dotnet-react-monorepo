# Monorepo

![API CI](https://github.com/grabreu/monorepo/actions/workflows/api-ci.yml/badge.svg)
![Web CI](https://github.com/grabreu/monorepo/actions/workflows/web-ci.yml/badge.svg)
[![Quality Gate - API](https://sonarcloud.io/api/project_badges/measure?project=grabreu_monorepo_api&metric=alert_status)](https://sonarcloud.io/dashboard?id=grabreu_monorepo_api)
[![Quality Gate - Web](https://sonarcloud.io/api/project_badges/measure?project=grabreu_monorepo_web&metric=alert_status)](https://sonarcloud.io/dashboard?id=grabreu_monorepo_web)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

Explore and validate a .NET + React monorepo foundation — repo structure, CI/CD, and GitHub conventions — using ASP.NET Core, Vite, and TanStack Router.

## Highlights

- Credential-less deploys — Azure login via OIDC, no cloud secrets stored in GitHub
- Quality gate — SonarCloud blocks merge on coverage, bugs, and vulnerabilities, not just formatting
- Path-filtered CI — each PR builds and tests only the app that actually changed
- Supply-chain hardening — every GitHub Action pinned to a commit SHA, container images deployed by immutable digest

## Apps

- [`apps/api`](apps/api) — ASP.NET Core, deployed to Azure Container Apps ([live](https://ca-monorepo-api-prod-brs.gentlecliff-429b9963.brazilsouth.azurecontainerapps.io/))
- [`apps/web`](apps/web) — Vite + React + TanStack Router, deployed to Azure Static Web Apps ([live](https://gray-field-0d74a620f.7.azurestaticapps.net/))

## Pipeline

```mermaid
flowchart LR
    subgraph PR["Pull request"]
        CI_API["api-ci\nformat · tests · Sonar"]
        CI_WEB["web-ci\ncheck · tests · Sonar"]
    end

    subgraph Main["Merge to main"]
        CD_API["api-cd\nformat · tests · Sonar · build image"]
        CD_WEB["web-cd\ncheck · tests · Sonar · build"]
    end

    PR -->|merge| Main
    CD_API -->|push| GHCR[("GHCR")]
    GHCR --> CA["Azure Container App\nprod-api"]
    CD_WEB --> SWA["Azure Static Web App\nprod-web"]
```

## Docs

- [`docs/adr/`](docs/adr) — architecture decisions
- [`docs/infra/`](docs/infra) — Azure infra setup (shared resources + per-app steps)
