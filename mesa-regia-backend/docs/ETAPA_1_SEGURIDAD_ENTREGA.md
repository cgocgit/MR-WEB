# Etapa 1 — mr-seguridad-service

Construcción de los CU no bloqueados de Seguridad/Administración conforme a Mesa_Regia_Especificacion_Construccion_Microservicios.md.

## Incluye
- V1 Flyway de mr_seguridad con las seis tablas aprobadas y datos base de roles/permisos/alcance.
- CU-01.03 Usuarios.
- CU-01.04 Roles.
- CU-01.05 Permisos.
- CU-01.06 Asignación de rol y rol-permiso-alcance.
- CU-01.07 Matriz de acceso.
- CU-01.08 Auditoría.
- CU-11.01 Configuración funcional.
- Seguridad por @PreAuthorize; el mecanismo de autenticación permanece deliberadamente no implementado.

## No incluye
CU-01.01 login, CU-01.02 logout completo, credenciales, sesiones y restablecimiento de contraseña.

## Validación
1. Configurar MR_SEGURIDAD_DB_USERNAME y MR_SEGURIDAD_DB_PASSWORD (y URL si no es localhost:3306/mr_seguridad).
2. Crear la base `mr_seguridad` vacía si todavía no existe. Flyway crea las tablas, no la base.
3. Ejecutar `./mvnw -pl mr-seguridad-service clean verify`.
4. Ejecutar `./mvnw -pl mr-seguridad-service spring-boot:run`.
5. Verificar `/actuator/health` y `/v3/api-docs`.

Los endpoints de negocio requieren un Authentication con authorities; no se incorporó un mecanismo temporal de login porque esa decisión permanece bloqueada.
