$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $PSScriptRoot
$manifest = Join-Path $PSScriptRoot "ETAPA_5_PAGOS_SHA256.txt"
$errors = @()
Get-Content -LiteralPath $manifest | ForEach-Object {
    if ($_ -match '^([0-9a-f]{64})  (.+)$') {
        $expected = $Matches[1]
        $relative = $Matches[2] -replace '/', [IO.Path]::DirectorySeparatorChar
        $path = Join-Path $base $relative
        if (-not (Test-Path -LiteralPath $path)) { $errors += "FALTA: $relative" }
        else {
            $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLowerInvariant()
            if ($actual -ne $expected) { $errors += "HASH DISTINTO: $relative" }
        }
    }
}
if ($errors.Count -gt 0) { $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }; throw "ETAPA 5 PAGOS: INTEGRIDAD FALLIDA" }
Write-Host "ETAPA 5 PAGOS: INTEGRIDAD OK" -ForegroundColor Green
