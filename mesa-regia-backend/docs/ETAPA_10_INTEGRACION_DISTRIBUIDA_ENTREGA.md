# Mesa Regia — Etapa 10: Integración distribuida

## 1. Objetivo

Conectar los microservicios construidos y validados en las etapas 1–9 sin introducir acceso cruzado a bases de datos ni dependencias Maven de dominio. La integración se realiza mediante puertos/adapters HTTP, identidad servicio-servicio, idempotencia, Saga durable, Inbox/Outbox y reconciliación.

## 2. Decisiones de construcción

### 2.1 Identidad servicio-servicio

Se implementa JWT interno HS256 de vida corta (90 s):

- `iss`: nombre del microservicio emisor.
- `aud`: `mesa-regia-internal`.
- `jti`: identificador único.
- cada servicio firma con su propio secreto.
- cada receptor mantiene una lista explícita de callers autorizados.
- los endpoints `/internal/v1/**` requieren `ROLE_INTERNAL_SERVICE`.
- en perfil `prod` no existen secretos por defecto.
- en perfiles no productivos se usa un secreto determinístico únicamente para desarrollo local.

Variables productivas:

- `MR_INTERNAL_SECRET_SEGURIDAD`
- `MR_INTERNAL_SECRET_CATALOGO`
- `MR_INTERNAL_SECRET_CLIENTES`
- `MR_INTERNAL_SECRET_INVENTARIO`
- `MR_INTERNAL_SECRET_PAGOS`
- `MR_INTERNAL_SECRET_COTIZACIONES`
- `MR_INTERNAL_SECRET_ORDENES`
- `MR_INTERNAL_SECRET_LOGISTICA`
- `MR_INTERNAL_SECRET_REPORTES`

Un receptor necesita conocer los secretos de los callers que tiene autorizados. Los secretos no se almacenan en el repositorio.

### 2.2 HTTP interno

Los clientes internos utilizan `RestClient`, propagan `X-Correlation-Id` y usan timeout configurable:

`MR_INTERNAL_HTTP_TIMEOUT_MS` (default local: 4000 ms).

URLs localmente configurables:

- `MR_SEGURIDAD_BASE_URL` → `http://localhost:8081`
- `MR_CATALOGO_BASE_URL` → `http://localhost:8082`
- `MR_CLIENTES_BASE_URL` → `http://localhost:8083`
- `MR_INVENTARIO_BASE_URL` → `http://localhost:8084`
- `MR_PAGOS_BASE_URL` → `http://localhost:8085`
- `MR_COTIZACIONES_BASE_URL` → `http://localhost:8086`
- `MR_ORDENES_BASE_URL` → `http://localhost:8087`
- `MR_LOGISTICA_BASE_URL` → `http://localhost:8088`

Reportes se ejecuta en `8089` y consume las fuentes anteriores.

### 2.3 Confirmación distribuida de Cotización

La secuencia durable es:

1. validar cobertura en Pagos;
2. expandir Productos/Paquetes con Catálogo;
3. crear reserva provisional idempotente en Inventario cuando existan productos;
4. generar Orden idempotente con snapshot inmutable;
5. vincular reserva con la Orden;
6. confirmar Cotización localmente;
7. persistir evento Outbox de confirmación.

Para cotizaciones exclusivamente de Servicios se omite la reserva de Inventario y la Orden puede tener `referencia_reserva_externa = null`.

### 2.4 Normalización de reserva provisional

Existía una dependencia circular: Inventario requería `idOrdenExterno` para reservar y Órdenes recibía una referencia de reserva al generarse. Se resuelve de forma evolutiva:

- Inventario crea una reserva provisional por `clave_confirmacion`;
- Cotizaciones genera la Orden;
- Cotizaciones vincula la reserva a `idOrdenExterno`.

La operación es idempotente y no requiere acceso cross-DB.

### 2.5 Saga, compensación y reconciliación

`mr-cotizaciones-service` incorpora persistencia durable de Saga:

- `saga_confirmacion`
- `integration_inbox`
- `integration_outbox`

Si una regla de negocio conocida rechaza la creación de Orden después de crear una reserva, se libera la reserva y la Saga queda compensada.

Ante una falla ambigua de red no se compensa de forma destructiva: la Saga queda en error y `SagaReconciliationJob` reintenta utilizando las claves idempotentes existentes.

### 2.6 Outbox / Inbox

Se adopta Outbox transaccional con despacho HTTP reintentable, sin acoplar el dominio a Kafka/RabbitMQ.

- Pagos persiste `IMPORTE_REQUERIDO_CUBIERTO` en Outbox dentro de la misma transacción del pago.
- Cotizaciones consume el evento mediante Inbox idempotente (`event_id` único).
- Cotizaciones persiste `COTIZACION_CONFIRMADA` en Outbox junto con la confirmación local.
- Órdenes persiste `ORDEN_ESTADO_CAMBIADO` en Outbox junto con el cambio local.
- dispatchers usan backoff y no mantienen una transacción DB abierta mientras realizan HTTP.

La semántica es al menos una vez; los eventos de negocio con efecto funcional usan deduplicación en el consumidor.

## 3. Migraciones incorporadas

### mr-inventario-service

`V2__reserva_confirmacion_distribuida.sql`

- `id_orden_externo` pasa a nullable;
- `clave_confirmacion` única;
- `id_cotizacion_externo`;
- `id_version_externa`.

### mr-pagos-service

`V2__integration_outbox.sql`

Crea `integration_outbox`.

### mr-cotizaciones-service

`V2__integracion_distribuida_saga_outbox.sql`

Crea `saga_confirmacion`, `integration_inbox` e `integration_outbox`.

### mr-ordenes-service

`V3__integration_outbox.sql`

Crea `integration_outbox`. La V2 de Órdenes de la Etapa 7 se conserva sin cambios.

## 4. Integraciones conectadas

- Cotizaciones → Clientes.
- Cotizaciones → Catálogo.
- Cotizaciones → Inventario.
- Cotizaciones → Pagos.
- Cotizaciones → Órdenes.
- Pagos → Cotizaciones (evento durable).
- Órdenes → Inventario (cancelación).
- Órdenes → Logística (cancelación).
- Logística → Órdenes (contexto e hitos).
- Inventario → Catálogo.
- Inventario → Órdenes.
- Inventario → Logística.
- Reportes → Clientes.
- Reportes → Cotizaciones.
- Reportes → Inventario.
- Reportes → Seguridad (auditoría de generación).
- Outbox de Cotizaciones/Órdenes → Seguridad (auditoría técnica/funcional).

## 5. Reportes

Los adapters reales reemplazan los sources temporales. Reportes conserva cero acceso directo a BD de negocio.

- Clientes: consulta paginada de `mr-clientes-service`.
- Cotizaciones: consulta paginada de `mr-cotizaciones-service`.
- Ventas: cotizaciones confirmadas.
- Inventario: existencias del almacén configurado.

`MR_INVENTARIO_ALMACEN_DEFAULT_ID` conserva default local `1`.

## 6. Seguridad de endpoints internos

Los endpoints internos dejan de depender únicamente del perfil local. En Inventario, Órdenes y Logística pueden habilitarse en producción porque ahora están protegidos por identidad interna. Pueden deshabilitarse mediante:

`MR_INTERNAL_ENDPOINTS_ENABLED=false`

No se convierten en endpoints públicos ni se elimina la autorización de usuario de las APIs `/api/v1/**`.

## 7. Lo que no se resuelve en esta etapa

- Autenticación de usuarios finales, sesión, credenciales y reset de contraseña: brecha de Seguridad ya documentada.
- Comprobante de Pago: la persistencia física continúa sin columna aprobada.
- Imágenes de Catálogo y privacidad de Clientes: brechas previas.
- Notificaciones multicanal/read-state: no existe modelo aprobado.
- Circuit breaker, tuning de pools, performance/carga y políticas avanzadas de observabilidad: Etapa 11 Hardening.
- Broker Kafka/RabbitMQ: no es necesario para esta implementación; se usa Outbox + HTTP durable y puede sustituirse posteriormente detrás de los puertos existentes.

## 8. Validaciones de cierre

### G3 — integración de servicios

- JWT interno válido aceptado y caller no autorizado rechazado.
- contratos HTTP reales sin dependencias Maven entre dominios.
- `X-Correlation-Id` propagado.
- timeouts configurables.
- ausencia de accesos cross-DB.
- adapters de Reportes consumen fuentes propietarias.

### G4 — Saga/Outbox

- reserva y Orden idempotentes;
- compensación segura ante rechazo conocido;
- falla ambigua queda pendiente para reconciliación;
- Outbox en misma transacción que el hecho de negocio;
- Inbox deduplica `IMPORTE_REQUERIDO_CUBIERTO`;
- reintentos con backoff;
- recuperación periódica de Saga.

Los gates solo se cierran después de `mvnw clean verify`, migraciones reales, arranque simultáneo y pruebas de integración en el entorno local del proyecto.
