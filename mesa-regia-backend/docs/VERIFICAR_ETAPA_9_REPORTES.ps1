$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Join-Path $PSScriptRoot "MANIFEST_ETAPA_9_REPORTES.sha256"
$errors = 0
Get-Content $manifest | ForEach-Object {
    if ($_ -match '^([0-9a-f]{64})  (.+)$') {
        $expected = $matches[1]
        $relative = $matches[2] -replace '/', [IO.Path]::DirectorySeparatorChar
        $path = Join-Path $root $relative
        if (-not (Test-Path -LiteralPath $path)) { Write-Host "FALTA: $relative" -ForegroundColor Red; $errors++; return }
        $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $expected) { Write-Host "HASH DIFERENTE: $relative" -ForegroundColor Red; $errors++ }
    }
}
if ($errors -gt 0) { throw "ETAPA 9 REPORTES: integridad fallida ($errors incidencia(s))" }
Write-Host "ETAPA 9 REPORTES: INTEGRIDAD OK" -ForegroundColor Green
