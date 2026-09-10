# Etapa 6 — mr-cotizaciones-service

Construcción de CU-05.01 a CU-05.14 sobre la baseline aprobada de `mr_cotizaciones`.

## Decisiones preservadas
- Cotización general y versiones son entidades distintas.
- Versiones: BORRADOR/ENVIADA. General: BORRADOR/EN_SEGUIMIENTO/CONFIRMADA/CANCELADA/RECHAZADA/VENCIDA.
- Crear/enviar no reserva inventario; disponibilidad es informativa.
- Cada versión usa una Lista de Precios y conserva snapshots de conceptos/precios.
- Servicios no se tarifan mediante Lista de Precios dentro de Cotizaciones; el precio se resuelve por Catálogo.
- Cancelación/rechazo son de la cotización general.
- Vencidas se muestran hasta un día después del evento y al final del listado.
- El estado de Cotizaciones tras confirmación es CONFIRMADA; la reserva mantiene su estado en Inventario.

## Normalización DDL
`cotizacion_version.id_lista_precio_externo` es NOT NULL. Por ello la construcción requiere `idListaPrecio` al crear la cotización para poder persistir V1 sin inventar un valor por defecto.

## Integraciones
Los puertos hacia Clientes, Catálogo, Inventario, Pagos y Órdenes están construidos. Los adapters reales/identidad servicio-servicio se incorporan en Etapa 10. Los adapters actuales responden Service Unavailable al invocarse.

## CU-05.11
La orquestación local, validaciones, compensación básica e interfaces están construidas. La durabilidad Saga/Outbox, reintentos persistentes e identidad interna permanecen pendientes de Etapa 10.

## PDF
El endpoint produce un PDF mínimo válido con folio y total. El contenido comercial/fiscal definitivo sigue pendiente; no se inventaron impuestos, cargos, firmas ni leyendas.
