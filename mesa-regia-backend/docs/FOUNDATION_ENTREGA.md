# Entrega 0 — Foundation

## Acción

Esta entrega **crea** el monorepo backend. No sustituye código backend existente.

## Contenido

- `pom.xml` raíz agregador/parent técnico.
- Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/wrapper`).
- Nueve módulos Spring Boot independientes.
- Clase `Application` por microservicio.
- Perfiles `local`, `test`, `prod`.
- Datasource exclusivo para los ocho servicios transaccionales.
- Flyway configurado en servicios transaccionales.
- Hibernate `ddl-auto=validate` en `local`/`prod`.
- Spring Security base sin decidir aún credenciales/JWT/sesiones.
- Error response base.
- `X-Correlation-Id` + MDC.
- Actuator health/info.
- SpringDoc OpenAPI.
- Prueba mínima de carga de contexto por servicio.
- Dependencias de Testcontainers MariaDB disponibles para pruebas de integración futuras.

## Decisión deliberada

Los directorios `db/migration` están preparados, pero Foundation **no crea migraciones V1 ficticias**. La especificación exige que `V1` refleje el DDL aprobado de cada dominio; ese DDL debe incorporarse al construir el microservicio correspondiente.

## Qué hacer con esta entrega

1. Descomprimir `mesa-regia-backend-foundation.zip` en la ubicación donde se alojará el backend.
2. Abrir terminal en `mesa-regia-backend/`.
3. Verificar Java 21 con `java -version`.
4. Ejecutar `mvnw.cmd clean verify` en Windows o `./mvnw clean verify` en Linux/macOS/Git Bash.
5. Confirmar que los nueve módulos muestran `BUILD SUCCESS` dentro del reactor.
6. Para probar un servicio transaccional en perfil `local`, crear/verificar su BD y definir las tres variables de datasource indicadas en `.env.example`.
7. Ejecutar el servicio con `spring-boot:run` y perfil `local`.
8. Verificar `/actuator/health` y `/v3/api-docs`.
9. Compartir el resultado de `clean verify` o el commit para validar Gate G0.

## Criterio G0

G0 se supera cuando el reactor completo compila/prueba correctamente y cada microservicio puede iniciar de forma independiente con su configuración local y su propia infraestructura.
