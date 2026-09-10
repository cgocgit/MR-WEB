# Mesa Regia Backend — Foundation

Foundation del monorepo Maven definida por `Mesa_Regia_Especificacion_Construccion_Microservicios.md` v1.1.

## Requisitos

- Java 21
- Acceso a Internet la primera vez que se ejecute `mvnw` (para descargar Maven y dependencias)
- MariaDB 12.3.3 para perfiles `local`/`prod` de servicios transaccionales

## Microservicios

| Módulo | Dominio | BD | Puerto local por defecto |
|---|---|---|---:|
| `mr-seguridad-service` | Seguridad / Administración | mr_seguridad | 8081 |
| `mr-catalogo-service` | Catálogo | mr_catalogo | 8082 |
| `mr-clientes-service` | Clientes / Prospectos | mr_clientes | 8083 |
| `mr-inventario-service` | Inventario | mr_inventario | 8084 |
| `mr-pagos-service` | Pagos | mr_pagos | 8085 |
| `mr-cotizaciones-service` | Cotizaciones | mr_cotizaciones | 8086 |
| `mr-ordenes-service` | Órdenes de Servicio | mr_ordenes | 8087 |
| `mr-logistica-service` | Logística | mr_logistica | 8088 |
| `mr-reportes-service` | Reportes | Sin BD transaccional | 8089 |

## Validación rápida de Foundation

En Linux/macOS/Git Bash:

```bash
./mvnw clean verify
```

En Windows CMD/PowerShell:

```bat
mvnw.cmd clean verify
```

Las pruebas de contexto usan el perfil `test`; para los ocho servicios transaccionales se usa H2 exclusivamente como prueba rápida de Foundation. Las pruebas posteriores de repositorio e integración deberán usar Testcontainers MariaDB cuando corresponda.

## Ejecución local de un servicio transaccional

Ejemplo Inventario:

1. Crear/verificar la base `mr_inventario` en MariaDB.
2. Exportar variables:
   - `MR_INVENTARIO_DB_URL`
   - `MR_INVENTARIO_DB_USERNAME`
   - `MR_INVENTARIO_DB_PASSWORD`
3. Ejecutar:

```bash
./mvnw -pl mr-inventario-service spring-boot:run -Dspring-boot.run.profiles=local
```

Flyway está habilitado en `local`/`prod` y Hibernate utiliza `ddl-auto=validate`. Las migraciones baseline reales se incorporarán al construir el dominio correspondiente, usando el DDL aprobado; Foundation no inventa DDL de negocio.

## Endpoints técnicos iniciales

- `/actuator/health`
- `/actuator/info`
- `/v3/api-docs`
- `/swagger-ui.html`

El resto de endpoints requiere autenticación por defecto. Foundation no implementa todavía credenciales, JWT, sesiones ni identidad servicio-servicio.

## Reglas importantes

- No hay dependencias Maven entre microservicios.
- Cada servicio tiene su propio artefacto y versión funcional.
- No existen entidades JPA ni reglas de negocio compartidas en la raíz.
- Los servicios transaccionales tienen datasource exclusivo.
- `mr-reportes-service` no incorpora JPA/Flyway/MariaDB porque no posee BD transaccional.
- La lógica de negocio futura seguirá `Controller → Service → Repository → BD propia` y usará puertos/adapters para integraciones.
