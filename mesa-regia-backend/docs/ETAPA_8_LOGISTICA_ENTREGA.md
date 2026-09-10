# Etapa 8 — mr-logistica-service

Construcción de CU-07.01 a CU-07.13.

## Decisiones de persistencia
- V1 conserva las 8 tablas aprobadas de `mr_logistica`.
- V2 agrega `etapa_logistica.duracion_prevista_minutos` porque la regla de tolerancia requiere comparar tiempo transcurrido contra tiempo previsto + tolerancia; el DDL baseline no almacenaba ese dato.
- `programacion_logistica` actúa como contenedor de ruta combinada; no se crea entidad Ruta.
- Las evidencias se almacenan como tres referencias, tal como permite el DDL. El binario queda fuera del servicio.
- Las fases de Inventario son de consulta en Logística; su actualización se conectará en la Etapa 10 mediante integración interna.
- La integración real con `mr-ordenes-service` queda detrás de `OrdenesLogisticaPort`; mientras no exista adapter real, las operaciones que requieren Orden/Hito responden 503 sin fabricar datos.

## Reglas principales
- Exactamente tres evidencias distintas + comentario para confirmar una fase operativa.
- Incidencias: REPORTADA → EN_SEGUIMIENTO → RESUELTA; no se reabren ni eliminan.
- El reporte de incidencia no bloquea las fases.
- Chófer/Representante solo operan programación asignada; Supervisor no ejecuta fases en representación de ellos.
- Traslados usan fecha/hora real y no duración fija.
- Tolerancias se copian a la fase al crear la programación.
- Cancelación logística se recibe desde Órdenes mediante endpoint interno y conserva trazabilidad.

## Brechas diferidas a Etapa 10
- Adapter real a Órdenes para consulta y hitos.
- Adapter real de `InventarioLogisticaPort` para consultar/sincronizar preparación, retorno e inspección.
- Adapter durable de `LogisticaEventPublisher` para alertas/eventos operativos.
- Sincronización interna de fases propiedad de Inventario.
- Identidad servicio-servicio y transporte durable de eventos/alertas.
- Disponibilidad avanzada de recursos por intervalos; con el DDL actual el control local detecta coincidencias de fecha/hora de preparación y la integración podrá enriquecerlo.

## Notas de trazabilidad
- RECEPCION y PLANEACION se registran como fases de sistema y quedan concluidas por la propia operación de programación; no representan una captura operativa de campo.
- El historial transversal de reprogramaciones/auditoría se publicará hacia la capacidad de auditoría en la Etapa 10; el DDL local conserva el motivo vigente y timestamps, sin inventar una tabla adicional fuera del diseño aprobado.
- Mientras la autenticación productiva no esté cerrada, los identificadores de usuario enviados en requests son validados contra la asignación local; posteriormente deberán derivarse del principal autenticado.
