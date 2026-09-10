$ErrorActionPreference = "Stop"
$services = @(
  @{Name='Seguridad'; Url='http://localhost:8081/actuator/health'},
  @{Name='Catalogo'; Url='http://localhost:8082/actuator/health'},
  @{Name='Clientes'; Url='http://localhost:8083/actuator/health'},
  @{Name='Inventario'; Url='http://localhost:8084/actuator/health'},
  @{Name='Pagos'; Url='http://localhost:8085/actuator/health'},
  @{Name='Cotizaciones'; Url='http://localhost:8086/actuator/health'},
  @{Name='Ordenes'; Url='http://localhost:8087/actuator/health'},
  @{Name='Logistica'; Url='http://localhost:8088/actuator/health'},
  @{Name='Reportes'; Url='http://localhost:8089/actuator/health'}
)
$fail = 0
foreach($s in $services){
  try {
    $r = Invoke-RestMethod -Uri $s.Url -Method Get -TimeoutSec 5
    if($r.status -eq 'UP'){ Write-Host ("{0,-14} UP" -f $s.Name) -ForegroundColor Green }
    else { Write-Host ("{0,-14} {1}" -f $s.Name,$r.status) -ForegroundColor Red; $fail++ }
  } catch { Write-Host ("{0,-14} ERROR: {1}" -f $s.Name,$_.Exception.Message) -ForegroundColor Red; $fail++ }
}
if($fail -gt 0){ throw "ETAPA 10: $fail servicio(s) no disponibles" }
Write-Host "ETAPA 10: los 9 servicios estan UP" -ForegroundColor Green
