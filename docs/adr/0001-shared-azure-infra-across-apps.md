# ADR-0001: Shared Azure infra across apps, no IaC

## Status

Accepted

## Context

Deploy target is a single personal Azure subscription, used across multiple unrelated app repos, not just this one. Free tier only allows one Container Apps Environment and one SQL Server per subscription.

## Decision

One Resource Group, one Container Apps Environment, one SQL Server (one database per app), and one App Registration for GitHub Actions OIDC — all shared across every app, provisioned once (see `docs/infra/shared-setup.md`). Each app only adds its own database, Container App, and a federated credential scoped to its repo (`docs/infra/new-app-setup.md`). Images are pulled from GitHub Container Registry, not Azure Container Registry. Everything is provisioned by hand via Azure CLI — no Bicep/Terraform, since there's one environment and one owner across all of it. No Key Vault yet either — secrets go straight on the Container App as env vars, or aren't needed at all where managed identity covers it (e.g. the SQL connection).

## Consequences

- Zero marginal Azure cost per new app, at the cost of per-app resource isolation — apps share a blast radius (one CAE, one SQL Server) instead of each having its own.
- The App Registration is reused everywhere; recreating it invalidates every app's federated credential at once, not just this repo's — a cross-repo operation, not a local one.
- Revisit if a second subscription, a paid tier, or another owner ever enters the picture — the shared-infra assumption stops holding at that point.
