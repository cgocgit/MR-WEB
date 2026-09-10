$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$manifest = Join-Path $PSScriptRoot "ETAPA_7_ORDENES_SHA256.txt"
$errors = @()
Get-Content $manifest | ForEach-Object {
  if ($_ -match '^([0-9a-f]{64})  (.+)$') {
    $expected=$matches[1]; $rel=$matches[2]; $path=Join-Path $root ($rel -replace '/', '\')
    if (-not (Test-Path -LiteralPath $path)) { $errors += "FALTA: $rel" }
    else { $actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLower(); if($actual -ne $expected){$errors += "HASH: $rel"} }
  }
}
if($errors.Count -gt 0){$errors|ForEach-Object{Write-Host $_ -ForegroundColor Red}; throw "ETAPA 7 ORDENES: INTEGRIDAD FALLIDA"}
Write-Host "ETAPA 7 ORDENES: INTEGRIDAD OK" -ForegroundColor Green
