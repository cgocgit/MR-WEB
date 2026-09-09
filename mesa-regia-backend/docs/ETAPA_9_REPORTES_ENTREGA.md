# Mesa Regia — Entrega Etapa 9: mr-reportes-service

## Alcance
Construcción de CU-09.01 a CU-09.05. El microservicio no posee base de datos transaccional propia y no contiene JPA, Repository ni Flyway.

## Contratos
- GET `/api/v1/reportes/ventas`
- GET `/api/v1/reportes/clientes`
- GET `/api/v1/reportes/cotizaciones`
- GET `/api/v1/reportes/inventario`
- GET `/api/v1/reportes/{tipo}/exportacion?format=PDF|XLSX|CSV`

Los filtros son genéricos y repetibles mediante `filtro=clave=valor`, además de `fechaInicio` y `fechaFin`. La Etapa 9 no inventa nombres de filtros funcionales que los CU no definen.

## Fuentes
Reportes nunca accede a bases de otros servicios. Se definen puertos para Ventas, Clientes, Cotizaciones e Inventario. Mientras no existan adapters reales (Etapa 10), los endpoints que requieren datos responden 503 de manera explícita.

## Exportación
CSV, XLSX y PDF se generan en memoria y no se persisten. XLSX y PDF se generan sin dependencias externas adicionales.

## Permiso
La especificación funcional completa menciona `reportes.consultar` y `reportes.exportar`, pero el catálogo físico real de Seguridad actualmente solo contiene `reportes.consultar`, y la especificación de construcción de microservicios usa ese mismo permiso. Por precedencia y compatibilidad, esta etapa protege tanto consulta como exportación con `reportes.consultar`. No se crea silenciosamente `reportes.exportar`.

## Auditoría
La generación se registra mediante `ReportGenerationAuditPort`. La implementación actual deja logging estructurado; la persistencia/auditoría durable mediante Seguridad o evento se integra en Etapa 10.

## Sin BD
No configurar `MR_REPORTES_DB_*`. El servicio debe iniciar sin MariaDB.

## Validación
```powershell
.\mvnw.cmd -pl mr-reportes-service clean verify
.\mvnw.cmd clean verify
.\mvnw.cmd -pl mr-reportes-service spring-boot:run
```
Puerto: `8089`.
