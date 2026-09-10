$ErrorActionPreference = "Stop"
$token = & "$PSScriptRoot\GENERAR_TOKEN_INTERNO_LOCAL.ps1" -ServiceName "mr-reportes-service"
$headers = @{ Authorization = "Bearer $token"; "X-Correlation-Id" = "stage10-smoke-$([guid]::NewGuid())" }
$response = Invoke-WebRequest -UseBasicParsing -Headers $headers -Uri "http://localhost:8086/internal/v1/cotizaciones?page=0&size=1"
if ($response.StatusCode -ne 200) { throw "Integración interna Reportes -> Cotizaciones falló: HTTP $($response.StatusCode)" }
Write-Host "ETAPA 10: JWT interno y contrato Reportes -> Cotizaciones OK" -ForegroundColor Green
