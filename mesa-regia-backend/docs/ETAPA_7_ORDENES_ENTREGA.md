# Etapa 7 — mr-ordenes-service

## Alcance
Implementa CU-06.01 a CU-06.10 sobre `mr_ordenes`.

## Normalización funcional/DDL
La baseline aprobada V1 no contiene `EN_REVISION_VENTAS`, aunque la línea funcional define ese estado como inicial. Se conserva V1 sin reescribir y V2 agrega el estado a `orden_servicio` e `historial_estado_orden` y cambia el default.

## Persistencia
Tablas propietarias: `orden_servicio`, `orden_detalle`, `historial_estado_orden`.
La Orden es snapshot inmutable. La revisión de Ventas y los hitos parciales se registran en historial.

## Hitos finales
- SERVICIOS: `SERVICIOS_CONCLUIDOS` => REALIZADA.
- PRODUCTOS: `INSPECCION_RETORNO_CONFIRMADA` => REALIZADA.
- MIXTA: se requieren ambos hitos; se persisten como acciones de historial sin ampliar el esquema.

## Integraciones pendientes de Etapa 10
- Cancelación de reserva en Inventario.
- Cancelación/retirada de programación en Logística.
- Transporte durable de `ORDEN_ESTADO_CAMBIADO`.
- Identidad/autorización servicio-servicio.

Mientras los adapters reales no existan, la cancelación que requiere dependencias responde 503 sin cambiar el estado local. La recuperación durable de fallos parciales se cierra en Etapa 10.

## Folio
No existe formato funcional cerrado para el folio de Orden. Se usa provisionalmente `OSMR-YY-ID` (ID con mínimo seis posiciones), como convención técnica interna y reemplazable sin afectar la identidad primaria.

## Jerarquía de detalle de paquetes
`orden_detalle.id_detalle_padre` se conserva y utiliza. El comando interno acepta `claveTemporal` y `clavePadreTemporal` para relacionar componentes con su paquete dentro del mismo request. El padre debe existir en la misma Orden y ser de tipo `PAQUETE`; las claves temporales no se persisten.
