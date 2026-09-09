# ETAPA 4 — mr-inventario-service

## Alcance
Construcción de CU-04.01 a CU-04.15 sobre la baseline física aprobada de `mr_inventario`.

## Tablas baseline (8)
`almacen`, `existencia`, `limite_inventario`, `reserva`, `reserva_detalle`, `corte_fisico`, `corte_detalle`, `movimiento_inventario`.

## Semántica de disponibilidad adoptada
`existencia_fisica` se conserva como cantidad registrada/poseída. Las reservas `CONFIRMADA` y `ACTIVA` reducen disponibilidad durante su periodo. La salida y el retorno generan trazabilidad, pero no modifican `existencia_fisica`; el retorno recupera disponibilidad al liberar la reserva. Esta decisión evita doble afectación y sigue la regla cerrada de Registro de salida que establece que la salida no disminuye la existencia registrada.

Existe una discrepancia documental con una especificación previa de Retorno que indica incrementar existencia al retornar. La entrega no oculta esa discrepancia: prioriza la consistencia con la fórmula de disponibilidad y la regla cerrada de Salida. Si el proyecto decide redefinir `existencia_fisica` como stock físicamente presente en almacén, deberá hacerse como ajuste funcional y migración coherente, modificando conjuntamente salida, retorno y cálculo de disponibilidad.

## Brechas de integración
- Validación de que una Orden exista/esté en estado compatible: el propietario es `mr-ordenes-service`, aún no construido en la secuencia actual. Se define `OrdenInventarioPort`; el adapter real se incorpora en Etapa 10.
- Estado logístico: se define `LogisticaInventarioPort` y se integra en Etapa 10; Inventario no modifica la BD de Logística.
- Datos descriptivos de producto: siguen siendo propiedad de Catálogo; Inventario persiste únicamente `id_producto_externo`. Se incluye `CatalogoProductoPort` para el adapter real de Etapa 10.
- Identidad servicio-servicio para `/internal/v1/**`: pendiente. Los endpoints internos están habilitados por defecto en `local/test` y deshabilitados por defecto en `prod`.

## Nota de idempotencia de Reserva
El contrato solicita unicidad por `id_orden_externo`, pero la baseline DDL aprobada posee índice no único. El Service evita duplicados por consulta previa; la garantía fuerte ante carreras concurrentes requiere una migración futura aprobada con `UNIQUE(id_orden_externo)` o mecanismo equivalente.

## Validación
1. Verificar manifest SHA-256.
2. Configurar `MR_INVENTARIO_DB_*`.
3. Si la BD preexiste: `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` y versión 1.
4. `./mvnw -pl mr-inventario-service clean verify`.
5. `./mvnw clean verify`.
6. Arrancar en puerto 8084 y validar health/OpenAPI/Swagger.


## Validación preventiva adicional
La entrega consolidada elimina construcciones JPQL no portables y usa consultas explícitas para carga con locks/EntityGraph.
