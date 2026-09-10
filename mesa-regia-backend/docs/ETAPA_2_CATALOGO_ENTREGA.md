# Mesa Regia — Etapa 2: mr-catalogo-service

## 1. Alcance de la entrega

Esta entrega construye de extremo a extremo los CU-03.01 a CU-03.09 del microservicio `mr-catalogo-service` sobre la base propietaria `mr_catalogo`.

Incluye:

- productos;
- servicios;
- paquetes y composición producto/servicio;
- categorías;
- tipos de producto;
- colores;
- listas de precios;
- precios de lista para PRODUCTO y PAQUETE;
- validación Jakarta;
- JPA/Hibernate;
- concurrencia optimista;
- permisos `@PreAuthorize`;
- manejo homogéneo de errores;
- correlation ID;
- OpenAPI/Swagger;
- Flyway V1;
- pruebas unitarias, de MVC y de contexto.

## 2. Reglas funcionales aplicadas

- Las bajas son lógicas mediante `activo`.
- Producto utiliza código único, categoría PRODUCTO, tipo de producto, color opcional, unidad de medida y `precio_base`.
- Servicio utiliza código único, categoría SERVICIO, `tipo_servicio` y `tarifa_base`.
- Servicio NO pertenece a Lista de Precios.
- Paquete NO tiene precio propio en el DDL vigente.
- El precio global de un paquete se define en `lista_precio_detalle`.
- Un componente de paquete es PRODUCTO o SERVICIO, nunca ambos.
- Cantidad de componente > 0.
- No se admiten componentes duplicados dentro de una misma actualización.
- Solo se agregan conceptos activos a nuevas composiciones de paquete.
- Un paquete activo debe conservar al menos un componente.
- Lista de Precios exige vigencia válida y porcentaje adicional entre 0 y 100.
- Un precio de lista solo puede referenciar PRODUCTO o PAQUETE.
- Las actualizaciones incluyen `version`; las operaciones sobre tablas detalle fuerzan incremento de versión del agregado propietario.

## 3. Esquema propietario

`V1__baseline_catalogo.sql` contiene exactamente estas nueve tablas:

1. `categoria`
2. `tipo_producto`
3. `color`
4. `producto`
5. `servicio`
6. `paquete`
7. `paquete_detalle`
8. `lista_precio`
9. `lista_precio_detalle`

Hibernate permanece con `ddl-auto=validate`.

## 4. Brecha de imágenes

El DDL vigente no tiene una referencia de imagen para Producto ni Servicio. Esta entrega no agrega columnas, Base64, filesystem, S3 u otro mecanismo no aprobado. La decisión de almacenamiento/referencia permanece bloqueada y deberá integrarse detrás de un puerto/adapter cuando se apruebe.

## 5. Auditoría/eventos

Las operaciones de escritura publican hechos mediante `DomainEventPublisher`. En esta etapa se provee `NoOpDomainEventPublisher` como adapter local, porque broker/Outbox y la persistencia durable de eventos se incorporarán en la etapa oficial de integración distribuida. No se accede directamente a `mr_seguridad`.

## 6. Aplicación de la entrega

La entrega es incremental: reemplaza por completo `mesa-regia-backend/mr-catalogo-service` y agrega archivos de documentación de la Etapa 2. No modifica `mr-seguridad-service` ni los demás microservicios.

Debido a la ruta local extensa del repositorio en Windows, se recomienda mapear temporalmente la raíz del repositorio a una unidad corta antes de extraer/copiar:

```powershell
subst R: "C:\RUTA\COMPLETA\HASTA\mr-web"
```

Después trabajar sobre:

```text
R:\mesa-regia-backend
```

Al finalizar puede eliminarse la unidad virtual con:

```powershell
subst R: /D
```

## 7. Base de datos local

La base debe existir:

```sql
CREATE DATABASE IF NOT EXISTS mr_catalogo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Variables de entorno:

```powershell
$env:MR_CATALOGO_DB_URL="jdbc:mariadb://localhost:3306/mr_catalogo"
$env:MR_CATALOGO_DB_USERNAME="TU_USUARIO"
$env:MR_CATALOGO_DB_PASSWORD="TU_PASSWORD"
```

### Base preexistente con DDL aprobado

Si `mr_catalogo` ya contiene las tablas aprobadas y aún no existe `flyway_schema_history`:

```powershell
$env:SPRING_FLYWAY_BASELINE_ON_MIGRATE="true"
$env:SPRING_FLYWAY_BASELINE_VERSION="1"
```

Esto registra el esquema existente como baseline V1 y evita volver a crear sus tablas.

### Base nueva y vacía

No configurar `baseline-on-migrate`; Flyway debe ejecutar `V1__baseline_catalogo.sql`.

## 8. Verificación de integridad de archivos

Desde `mesa-regia-backend`:

```powershell
powershell -ExecutionPolicy Bypass -File .\docs\VERIFICAR_ETAPA_2_CATALOGO.ps1
```

Debe terminar indicando que todos los archivos del módulo coinciden con el manifest SHA-256.

## 9. Validación Maven

Desde la raíz `mesa-regia-backend`:

```powershell
.\mvnw.cmd -pl mr-catalogo-service clean verify
```

Resultado esperado:

```text
BUILD SUCCESS
```

Después validar todo el reactor:

```powershell
.\mvnw.cmd clean verify
```

También debe terminar con `BUILD SUCCESS`.

## 10. Arranque independiente

```powershell
.\mvnw.cmd -pl mr-catalogo-service spring-boot:run
```

Puerto local por defecto: `8082`.

Validaciones:

- Health: `http://localhost:8082/actuator/health`
- OpenAPI JSON: `http://localhost:8082/v3/api-docs`
- Swagger UI: `http://localhost:8082/swagger-ui/index.html`

Los endpoints de negocio pueden responder 403 desde Swagger mientras la autenticación productiva continúe bloqueada. No se debe cambiar `permitAll` ni retirar `@PreAuthorize` para forzar una prueba manual.

## 11. Permisos implementados

- `catalogo.consultar`
- `catalogo.productos.registrar`
- `catalogo.productos.modificar`
- `catalogo.productos.desactivar`
- `catalogo.servicios.registrar`
- `catalogo.servicios.modificar`
- `catalogo.servicios.desactivar`
- `catalogo.paquetes.registrar`
- `catalogo.paquetes.modificar`
- `catalogo.paquetes.desactivar`
- `catalogo.auxiliares.gestionar`
- `catalogo.precios.gestionar`

## 12. Endpoints principales

- `/api/v1/productos`
- `/api/v1/servicios`
- `/api/v1/paquetes`
- `/api/v1/paquetes/{id}/componentes`
- `/api/v1/categorias`
- `/api/v1/tipos-producto`
- `/api/v1/colores`
- `/api/v1/listas-precios`
- `/api/v1/listas-precios/{id}/precios`

## 13. Criterio de cierre

G1 de cada CU y G2 del microservicio se cerrarán únicamente después de:

1. integridad de archivos confirmada;
2. `mr-catalogo-service clean verify` con BUILD SUCCESS;
3. reactor completo con BUILD SUCCESS;
4. arranque independiente exitoso;
5. MariaDB/Flyway/Hibernate validate correctos;
6. Actuator UP;
7. OpenAPI/Swagger disponibles;
8. commit revisado.
