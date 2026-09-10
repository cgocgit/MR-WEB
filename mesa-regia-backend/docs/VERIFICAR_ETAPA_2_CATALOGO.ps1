$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Manifest = Join-Path $PSScriptRoot "ETAPA_2_CATALOGO_MANIFEST.sha256"

if (-not (Test-Path -LiteralPath $Manifest)) {
    Write-Error "No existe el manifest: $Manifest"
    exit 1
}

$missing = @()
$changed = @()
$checked = 0

Get-Content -LiteralPath $Manifest | ForEach-Object {
    if ([string]::IsNullOrWhiteSpace($_)) { return }
    $parts = $_ -split "  ", 2
    $expected = $parts[0].Trim().ToLowerInvariant()
    $relative = $parts[1].Trim().Replace('/', [IO.Path]::DirectorySeparatorChar)
    $path = Join-Path $Root $relative
    if (-not (Test-Path -LiteralPath $path)) {
        $missing += $relative
        return
    }
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) {
        $changed += $relative
    }
    $checked++
}

Write-Host "Archivos verificados: $checked"
if ($missing.Count -gt 0) {
    Write-Host "Faltantes:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}
if ($changed.Count -gt 0) {
    Write-Host "Hash distinto:" -ForegroundColor Yellow
    $changed | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}
if ($missing.Count -eq 0 -and $changed.Count -eq 0) {
    Write-Host "ETAPA 2 CATALOGO: INTEGRIDAD OK" -ForegroundColor Green
    exit 0
}
exit 1
