param(
    [Parameter(Mandatory=$true)][string]$ServiceName
)
$ErrorActionPreference = "Stop"
function B64Url([byte[]]$bytes) {
    return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
}
$secretVars = @{
  'mr-seguridad-service'='MR_INTERNAL_SECRET_SEGURIDAD'; 'mr-catalogo-service'='MR_INTERNAL_SECRET_CATALOGO';
  'mr-clientes-service'='MR_INTERNAL_SECRET_CLIENTES'; 'mr-inventario-service'='MR_INTERNAL_SECRET_INVENTARIO';
  'mr-pagos-service'='MR_INTERNAL_SECRET_PAGOS'; 'mr-cotizaciones-service'='MR_INTERNAL_SECRET_COTIZACIONES';
  'mr-ordenes-service'='MR_INTERNAL_SECRET_ORDENES'; 'mr-logistica-service'='MR_INTERNAL_SECRET_LOGISTICA';
  'mr-reportes-service'='MR_INTERNAL_SECRET_REPORTES'
}
if(-not $secretVars.ContainsKey($ServiceName)){ throw "Servicio interno desconocido: $ServiceName" }
$envName = $secretVars[$ServiceName]
$secret = [Environment]::GetEnvironmentVariable($envName)
if([string]::IsNullOrWhiteSpace($secret)){ $secret = "mesa-regia-local-$ServiceName-secret-v1" }
$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$header = '{"alg":"HS256","typ":"JWT"}'
$payloadObj = [ordered]@{ iss=$ServiceName; aud='mesa-regia-internal'; iat=$now; exp=$now+90; jti=[guid]::NewGuid().ToString() }
$payload = $payloadObj | ConvertTo-Json -Compress
$enc = [Text.Encoding]::UTF8
$h = B64Url $enc.GetBytes($header)
$p = B64Url $enc.GetBytes($payload)
$input = "$h.$p"
$hmac = [System.Security.Cryptography.HMACSHA256]::new($enc.GetBytes($secret))
try { $sig = B64Url $hmac.ComputeHash($enc.GetBytes($input)) } finally { $hmac.Dispose() }
Write-Output "$input.$sig"
