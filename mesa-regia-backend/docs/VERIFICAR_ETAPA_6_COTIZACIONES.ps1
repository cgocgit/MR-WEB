$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Join-Path $PSScriptRoot "MANIFEST_ETAPA_6_COTIZACIONES.sha256"
$errores = 0
Get-Content $manifest | ForEach-Object {
  if ($_ -match '^([0-9a-f]{64})  (.+)$') {
    $esperado = $Matches[1]; $rel = $Matches[2]; $archivo = Join-Path $root ($rel -replace '/', '\')
    if (-not (Test-Path -LiteralPath $archivo)) { Write-Host "FALTA: $rel"; $errores++; return }
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivo).Hash.ToLowerInvariant()
    if ($actual -ne $esperado) { Write-Host "DIFERENTE: $rel"; $errores++ }
  }
}
if ($errores -gt 0) { throw "ETAPA 6 COTIZACIONES: integridad con $errores incidencia(s)." }
Write-Host "ETAPA 6 COTIZACIONES: INTEGRIDAD OK"
