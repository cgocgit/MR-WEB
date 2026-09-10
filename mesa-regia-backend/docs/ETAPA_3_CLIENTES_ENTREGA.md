# Etapa 3 — mr-clientes-service

## Alcance construido

- CU-02.01: búsqueda y consulta paginada por nombre, contacto, estado derivado y activo.
- CU-02.02: alta de Prospecto con datos que actualmente soporta el DDL y contactos opcionales.
- CU-02.03: detalle con contactos.
- CU-02.04: actualización de identificación y CRUD/baja lógica de contactos.
- CU-02.05: transición manual PROSPECTO -> CLIENTE o PROSPECTO_REVISADO con optimistic locking.

## Regla de estado

El contrato externo usa PROSPECTO, CLIENTE y PROSPECTO_REVISADO. El DDL aprobado los representa de esta forma:

- PROSPECTO = clasificacion PROSPECTO + estado_prospecto PENDIENTE.
- PROSPECTO_REVISADO = clasificacion PROSPECTO + estado_prospecto REVISADO.
- CLIENTE = clasificacion CLIENTE + estado_prospecto NULL.

No se permite CLIENTE -> PROSPECTO ni PROSPECTO_REVISADO -> CLIENTE en esta iteración.

## Brechas conservadas deliberadamente

El DDL V1 aprobado de mr_clientes solo contiene cliente_prospecto y contacto. No contiene columnas/tablas para cumpleaños, aceptación/fecha/evidencia de privacidad, domicilio o evento. Por la regla de precedencia no se inventaron esas estructuras.

Consecuencias:

- CU-02.02 no puede cerrar completamente el requisito de aceptación de privacidad.
- CU-02.03/02.04 no pueden exponer/modificar cumpleaños o privacidad todavía.
- Cotizaciones asociadas no se duplican aquí; la especificación indica consultarlas aparte cuando la pantalla lo requiera.
- La clasificación genera trazabilidad técnica por correlationId/evento, pero la integración durable de auditoría queda para la etapa de integración con Seguridad/plataforma.

## Variables locales

MR_CLIENTES_DB_URL=jdbc:mariadb://localhost:3306/mr_clientes
MR_CLIENTES_DB_USERNAME=<usuario>
MR_CLIENTES_DB_PASSWORD=<password>

Para una BD preexistente sin flyway_schema_history:
SPRING_FLYWAY_BASELINE_ON_MIGRATE=true
SPRING_FLYWAY_BASELINE_VERSION=1

## Validación

1. .\\mvnw.cmd -pl mr-clientes-service clean verify
2. .\\mvnw.cmd clean verify
3. .\\mvnw.cmd -pl mr-clientes-service spring-boot:run
4. GET http://localhost:8083/actuator/health -> 200 / UP
5. http://localhost:8083/swagger-ui/index.html
6. http://localhost:8083/v3/api-docs
