# New app setup

Steps repeated **for each app** built on top of the shared infra (see [`shared-setup.md`](shared-setup.md)). Replace `<app>` with the real name (e.g. `product-catalog`).

## 1. Create the database on the shared SQL Server

```powershell
az sql db create `
  --resource-group rg-shared-prod-brs `
  --server sql-shared-prod-brs-grabreu `
  --name sqldb-<app>-prod `
  --edition GeneralPurpose `
  --compute-model Serverless `
  --family Gen5 `
  --capacity 1 `
  --use-free-limit `
  --free-limit-exhaustion-behavior AutoPause
```

## 2. Create the Container App (with managed identity)

```powershell
az containerapp create `
  --name ca-<app>-api-prod-brs `
  --resource-group rg-shared-prod-brs `
  --environment cae-shared-prod-brs `
  --image ghcr.io/grabreu/<app>-api:latest `
  --target-port 8080 `
  --ingress external `
  --min-replicas 0 `
  --max-replicas 1 `
  --cpu 0.25 `
  --memory 0.5Gi `
  --system-assigned
```

## 3. Authorize the identity inside the database

Connect to the `sqldb-<app>-prod` database (portal Query editor or `sqlcmd`) as admin, and run:

```sql
CREATE USER [ca-<app>-api-prod-brs] FROM EXTERNAL PROVIDER;

ALTER ROLE db_ddladmin ADD MEMBER [ca-<app>-api-prod-brs];
ALTER ROLE db_datareader ADD MEMBER [ca-<app>-api-prod-brs];
ALTER ROLE db_datawriter ADD MEMBER [ca-<app>-api-prod-brs];
```

## 4. Set the connection string as an env var

```powershell
az containerapp update `
  --name ca-<app>-api-prod-brs `
  --resource-group rg-shared-prod-brs `
  --set-env-vars "ConnectionStrings__Default=Server=tcp:sql-shared-prod-brs-grabreu.database.windows.net,1433;Initial Catalog=sqldb-<app>-prod;Encrypt=True;TrustServerCertificate=False;Authentication=\"Active Directory Default\";"
```

## 5. Federated credential for the API deploy, on the shared App Registration

Only the API deploy uses OIDC (`azure/login`) — the Static Web App deploy in step 8 uses its own token instead, no federated credential needed for it.

Repos created after 2026-07-15 use the **immutable** subject claim format (numeric ID, survives org/repo renames) instead of the old name-based one — see [official docs](https://docs.github.com/en/actions/reference/security/oidc#immutable-subject-claims). Get the IDs:

```powershell
curl https://api.github.com/users/grabreu
curl https://api.github.com/repos/grabreu/<app>
```

Get the shared App Registration's object id (the `--id` below is that, not the `appId`):

```powershell
az ad app list --display-name gh-deploy-shared-prod-brs --query "[0].id" -o tsv
```

Create `credential.json` (immutable format: `OWNER@OWNER-ID/REPO@REPO-ID`):

```json
{
  "name": "<app>-env-prod-api",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:grabreu@<USER_ID>/<app>@<REPO_ID>:environment:prod-api",
  "audiences": ["api://AzureADTokenExchange"]
}
```

```powershell
az ad app federated-credential create `
  --id <app-registration-object-id> `
  --parameters credential.json
```

## 6. Create the Static Web App linked to the repository

```powershell
az staticwebapp create `
  --name swa-<app>-web-prod-brs `
  --resource-group rg-shared-prod-brs `
  --location eastus2 `
  --sku Free
```

## 7. Create the `prod-api` and `prod-web` environments in this repo

Restrict deployment branches to `main` on both.

### `prod-api` environment: Variables

`AZURE_CLIENT_ID`, `AZURE_TENANT_ID` and `AZURE_SUBSCRIPTION_ID` are the same across all repos — see `shared-setup.md`.

### `prod-web` environment: Secret

```powershell
# AZURE_STATIC_WEB_APPS_API_TOKEN — app-specific
az staticwebapp secrets list --name swa-<app>-web-prod-brs --resource-group rg-shared-prod-brs --query "properties.apiKey"
```
