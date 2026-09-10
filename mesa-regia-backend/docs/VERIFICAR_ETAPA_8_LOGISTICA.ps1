$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$manifestPath = Join-Path $root "docs\ETAPA_8_LOGISTICA_SHA256.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$errors = @()
foreach ($item in $manifest.files) {
    $path = Join-Path $root ($item.file -replace '/', '\\')
    if (-not (Test-Path -LiteralPath $path)) { $errors += "FALTA: $($item.file)"; continue }
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLowerInvariant()
    if ($hash -ne $item.sha256.ToLowerInvariant()) { $errors += "HASH DISTINTO: $($item.file)" }
}
if ($errors.Count -gt 0) { $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }; exit 1 }
Write-Host "ETAPA 8 LOGISTICA: INTEGRIDAD OK" -ForegroundColor Green
