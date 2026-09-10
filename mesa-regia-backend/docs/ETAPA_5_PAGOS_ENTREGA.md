# ETAPA 5 — mr-pagos-service

## Alcance
Construcción de CU-08.01 a CU-08.05 sobre la baseline aprobada de `mr_pagos`.

## Tablas baseline (4)
`cuenta_cobro`, `pago`, `aplicacion_pago`, `movimiento_cuenta`.

## Reglas implementadas
- Pagos únicamente manuales mediante `EFECTIVO` o `TRANSFERENCIA`.
- Múltiples pagos parciales; el pago original es inmutable.
- Corrección mediante movimiento `COMPENSACION` de naturaleza `CARGO`; no se edita ni elimina Pago.
- `Idempotency-Key` obligatorio para registro de pago y compensación. Pago usa `pago.clave_operacion`; compensación usa `movimiento_cuenta.clave_operacion`.
- Cuenta acumulada: ABONOS - CARGOS. El estado monetario se recalcula como ABIERTA, CONFIRMACION_CUBIERTA o LIQUIDADA.
- El umbral de confirmación se calcula con el importe total y porcentaje snapshot de la cotización. La comparación usa importes exactos; el porcentaje cubierto es informativo y se redondea a 2 decimales solo para presentación.
- Al cruzar el umbral se crea una sola marca local `CONFIRMACION` y se publica `IMPORTE_REQUERIDO_CUBIERTO` mediante `DomainEventPublisher`. Un marcador previo impide volver a disparar el flujo por pagos posteriores.

## Brechas deliberadamente conservadas
### Comprobante
El CU define comprobante opcional, pero `pago` no tiene columna de referencia. Se define `FileStoragePort`; mientras no exista migración aprobada, una solicitud que incluya `comprobanteReferencia` se rechaza de forma explícita en lugar de perder el dato silenciosamente.

### Cotizaciones
La creación inicial de `CuentaCobro` requiere total, porcentaje, versión elegida y snapshots propiedad de Cotizaciones. Se define `CotizacionPaymentContextPort`. El adapter real se incorpora en Etapa 10; si la cuenta aún no existe, el fallback actual responde 503.

### Evento durable / Outbox
El dominio publica `IMPORTE_REQUERIDO_CUBIERTO` detrás de `DomainEventPublisher` y conserva un movimiento `CONFIRMACION` idempotente. El adapter durable Outbox/broker y recuperación se incorporan en Etapa 10/G4.

### Resultado de confirmación
La especificación más reciente establece que Pagos informa el hecho y Cotizaciones decide confirmar. Por ello esta etapa no hace acceso directo a Inventario/Órdenes ni fabrica referencias de reserva/orden. Los campos genéricos de integración de `movimiento_cuenta` quedan preparados para el adapter posterior.

### Compensaciones
La política detallada de límites parciales/totales y efectos posteriores no está definida. La construcción exige monto positivo, motivo, pago original e idempotencia, pero no inventa límites financieros adicionales.

## Validación
1. Verificar manifest SHA-256.
2. Configurar `MR_PAGOS_DB_*`.
3. Si la BD preexiste: `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` y versión 1.
4. `./mvnw -pl mr-pagos-service clean verify`.
5. `./mvnw clean verify`.
6. Arrancar en puerto 8085 y validar health/OpenAPI/Swagger.
