# Shared infra — setup from scratch

Resources created **once**, shared by every app (Container Apps Environment, SQL Server, CI/CD App Registration). Per-app steps live in [`new-app-setup.md`](new-app-setup.md).

## Decisions

- Free tier: only 1 CAE and 1 SQL Server allowed — solved with **one server, multiple databases** (one per app) and **one CAE, multiple Container Apps**.
- No ACR — using public **GitHub Container Registry (GHCR)**.
- No Key Vault for now — secret goes straight on the Container App, or not even that (managed identity).
- **Prod** only for now, but the naming convention already supports dev/staging later.
- Region: **Brazil South** (`brazilsouth` / `brs`).
- DB auth: managed identity per app, no password in the connection string. SQL admin kept only for setup/emergency.

## Naming convention

```text
rg-<workload>-<env>-<region>
cae-<workload>-<env>-<region>
ca-<app>-api-<env>-<region>
swa-<app>-web-<env>-<region>
sql-<workload>-<env>-<region>
sqldb-<app>-<env>
```

E.g.: `rg-shared-prod-brs`, `ca-app1-api-prod-brs`, `sqldb-app1-prod`

## 1. Resource Group

```powershell
az group create --name rg-shared-prod-brs --location brazilsouth
```

## 2. Container Apps Environment

```powershell
az containerapp env create `
  --name cae-shared-prod-brs `
  --resource-group rg-shared-prod-brs `
  --location brazilsouth
```

## 3. SQL Server (logical server)

⚠️ Server name is **global and unique** — may need a suffix if already taken (e.g. ended up as `sql-shared-prod-brs-grabreu`). Confirm the real name after creating.

```powershell
az sql server create `
  --name sql-shared-prod-brs `
  --resource-group rg-shared-prod-brs `
  --location brazilsouth `
  --admin-user sqladmin `
  --admin-password "<strong-password-here>"
```

Confirm the real name (and FQDN):

```powershell
az sql server list --resource-group rg-shared-prod-brs --query "[].{name:name, fqdn:fullyQualifiedDomainName}" -o table
```

## 4. SQL Server firewall

Allow your IP to run the setup commands:

```powershell
az sql server firewall-rule create `
  --resource-group rg-shared-prod-brs `
  --server <real-server-name> `
  --name AllowMyIp `
  --start-ip-address <your-ip> `
  --end-ip-address <your-ip>
```

IP: `curl ifconfig.me`

## 5. Azure AD admin on the server (enables managed identity)

```powershell
az ad signed-in-user show --query id -o tsv
```

```powershell
az sql server ad-admin create `
  --resource-group rg-shared-prod-brs `
  --server <real-server-name> `
  --display-name "<your-aad-user>" `
  --object-id <object-id-from-command-above>
```

Doesn't disable SQL auth for the admin — both methods coexist.

## 6. Shared App Registration for CI/CD (GitHub Actions via OIDC)

```powershell
az ad app create --display-name gh-deploy-shared-prod-brs
```

Note the returned `appId`.

```powershell
az ad sp create --id <appId>
```

```powershell
az role assignment create `
  --assignee <appId> `
  --role "Container Apps Contributor" `
  --scope /subscriptions/<subscription-id>/resourceGroups/rg-shared-prod-brs
```

This App Registration is **reused by every app** — don't recreate it per app, just add a new federated credential per repository (see `new-app-setup.md`).

## Fixed values for GitHub Secrets (same across all API repos)

```powershell
# AZURE_CLIENT_ID
az ad app list --display-name gh-deploy-shared-prod-brs --query "[0].appId" -o tsv

# AZURE_TENANT_ID
az account show --query tenantId -o tsv

# AZURE_SUBSCRIPTION_ID
az account show --query id -o tsv
```

## If it needs to be recreated

- **CAE**: safe to delete and recreate — config lives on the Container Apps, not the environment itself (but the Container Apps end up orphaned, need recreating too).
- **SQL Server**: name can't be renamed — delete + recreate only. Databases inside it can be renamed via `ALTER DATABASE ... MODIFY NAME`.
- **App Registration**: can be recreated, but invalidates every federated credential — requires re-registering `AZURE_CLIENT_ID` in every repo.
