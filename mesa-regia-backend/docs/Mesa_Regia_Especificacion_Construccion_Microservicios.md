# Mesa Regia — Especificación de construcción de microservicios

**Versión:** 1.1  
**Fecha:** 2026-09-07

## 1. Propósito y alcance
Esta especificación transforma el análisis y diseño previo en instrucciones de construcción para el backend. Mantiene ocho microservicios transaccionales propietarios de sus bases, Reportes sin BD transaccional y capacidades transversales para soporte/plataforma.

## 2. Arquitectura
```text
Controller → Service → Repository → MariaDB propia
                     ↕
             Integration Ports
```
No se permite Controller→Repository ni acceso de un microservicio a la BD de otro.

## 3. Stack
| Herramienta | Base | Estado | Uso |
|---|---|---|---|
| Java | 21 | Confirmado | Línea base del backend y del repositorio previo. |
| Spring Boot | 3.5.8 | Baseline de construcción | Versión efectiva del pom.xml previo; se centraliza en parent Maven para poder actualizarla en un solo punto. |
| Maven | Wrapper + parent común | Confirmado | Construcción reproducible y dependencia centralizada. |
| Spring Web MVC | Starter Web | Confirmado | APIs REST síncronas; no se adopta stack reactivo sin necesidad. |
| Spring Data JPA / Hibernate | Gestionado por Spring Boot | Confirmado | Persistencia por repositorios JPA. |
| Spring HATEOAS | Gestionado por Spring Boot | Confirmado | HAL/HAL-FORMS y acciones disponibles por estado/permiso. |
| SpringDoc OpenAPI | 2.8.13 | Confirmado por antecedente | Swagger UI y contrato OpenAPI. |
| Jakarta Validation | Starter Validation | Confirmado / reforzado | Validación estructural de request DTO. |
| Lombok | Gestionado por build | Confirmado | Uso restringido: Getter/Setter/Builder cuando aporte; evitar @Data en entidades JPA. |
| MariaDB | 12.3.3 | Confirmado | Persistencia productiva. |
| MariaDB JDBC Driver | Gestionado por Spring Boot | Requerido | Driver productivo; no usar MySQL driver como sustituto. |
| Spring Security | Spring Boot starter | Adición requerida | Necesaria para CU-01 y autorización homogénea. |
| H2 | Pruebas rápidas | Confirmado | No sustituye pruebas de integración contra MariaDB. |
| Testcontainers MariaDB | Versión gestionada | Adición recomendada | Valida SQL, locking e integración con el mismo motor. |
| Flyway | Versión gestionada | Requerido para construcción evolutiva | Versiona ajustes futuros de esquema; el DDL validado se conserva como baseline/provisioning. |
| Actuator | Versión gestionada | Adición recomendada | Health/readiness y soporte de diagnóstico CU-11.04. |
| JUnit / Mockito | Spring Boot Test | Confirmado | Pruebas unitarias y de integración. |

## 4. Módulos
| Módulo | Dominio | BD | CU |
|---|---|---|---|
| `mr-seguridad-service` | Seguridad / Administración | `mr_seguridad` | CU-01 y CU-11.01/11.04 |
| `mr-clientes-service` | Clientes / Prospectos | `mr_clientes` | CU-02 |
| `mr-catalogo-service` | Catálogo | `mr_catalogo` | CU-03 |
| `mr-inventario-service` | Inventario | `mr_inventario` | CU-04 |
| `mr-cotizaciones-service` | Cotizaciones | `mr_cotizaciones` | CU-05 |
| `mr-pagos-service` | Pagos | `mr_pagos` | CU-08 |
| `mr-ordenes-service` | Órdenes de Servicio | `mr_ordenes` | CU-06 |
| `mr-logistica-service` | Logística | `mr_logistica` | CU-07 |
| `mr-reportes-service` | Reportes | `Sin BD transaccional` | CU-09 |

## 5. Estructura estándar
```text
api/controller, api/request, api/response, api/assembler
application/service, application/service/impl
domain/entity, domain/enums
repository
mapper
integration/client, integration/dto, integration/event, integration/file
scheduler, security, exception, config
```

## 6. Contratos por dominio
### Seguridad / Administración
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-01.01 | POST | /api/v1/auth/login | Público | AuthenticationService.authenticate | Implementación de credenciales/sesión bloqueada hasta decisión arquitectónica. |
| CU-01.02 | POST | /api/v1/auth/logout | Autenticado | AuthenticationService.logout | Debe ser repetible; revocación depende de estrategia de sesión/token. |
| CU-01.03 | GET | /api/v1/usuarios | usuarios.consultar | UsuarioService.buscar | Paginación, filtros, alcance. |
| CU-01.03 | GET | /api/v1/usuarios/{id} | usuarios.consultar | UsuarioService.obtener | 404 si no existe. |
| CU-01.03 | POST | /api/v1/usuarios | usuarios.registrar | UsuarioService.registrar | 201; auditoría local en misma transacción. |
| CU-01.03 | PUT | /api/v1/usuarios/{id} | usuarios.modificar | UsuarioService.actualizar | Request incluye version. |
| CU-01.03 | PATCH | /api/v1/usuarios/{id}/estado | usuarios.desactivar | UsuarioService.cambiarEstado | Baja lógica; no DELETE físico. |
| CU-01.04 | GET | /api/v1/roles | roles.consultar | RolService.buscar | Consulta de roles vigentes. |
| CU-01.04 | POST/PUT/PATCH | /api/v1/roles[...] | permisos.modificar* | RolService.* | *Reutiliza vocabulario actual; no existe permiso granular roles.modificar en frontend. |
| CU-01.05 | GET | /api/v1/permisos | permisos.consultar | PermisoService.buscar | Códigos homologados con frontend. |
| CU-01.05 | PUT/PATCH | /api/v1/permisos/{id}[...] | permisos.modificar | PermisoService.* | Mantener código estable salvo migración explícita. |
| CU-01.06 | PUT | /api/v1/usuarios/{id}/rol | usuarios.rol.asignar | UsuarioService.asignarRol | Usuario tiene un rol activo; permisos se derivan del rol. |
| CU-01.06 | GET/PUT | /api/v1/roles/{id}/permisos | permisos.consultar / permisos.modificar | RolPermisoService.* | Incluye alcance; no UsuarioPermiso. |
| CU-01.07 | GET | /api/v1/matriz-acceso | matriz.consultar | AccessMatrixService.consultar | Read model de rol-permiso-alcance. |
| CU-01.08 | GET | /api/v1/auditoria | auditoria.consultar | AuditoriaService.buscar | Paginado y filtrable por fecha, usuario, módulo, acción, correlación. |
| CU-11.01 | GET/PUT | /api/v1/configuracion[/{clave}] | configuracion.consultar / configuracion.modificar | ConfiguracionService.* | Solo parámetros funcionales aprobados. |
| Compat. frontend | POST | /api/v1/usuarios/{id}/restablecer-password | usuarios.password.restablecer | CredentialService.reset | Bloqueado hasta modelo de credenciales. |

### Clientes / Prospectos
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-02.01 | GET | /api/v1/clientes-prospectos | clientes.consultar / clientes.buscar | ClienteProspectoService.buscar | Filtros por nombre, contacto, clasificación, activo. |
| CU-02.02 | POST | /api/v1/clientes-prospectos | clientes.registrar | ClienteProspectoService.registrarProspecto | Puede incluir contactos; privacidad requiere ajuste de persistencia antes de cierre. |
| CU-02.03 | GET | /api/v1/clientes-prospectos/{id} | clientes.consultar | ClienteProspectoService.obtenerDetalle | Incluye contactos; Cotizaciones se consulta aparte si la pantalla lo requiere. |
| CU-02.04 | PUT | /api/v1/clientes-prospectos/{id} | clientes.modificar | ClienteProspectoService.actualizar | Optimistic locking con version. |
| CU-02.04 | GET/POST/PUT/PATCH | /api/v1/clientes-prospectos/{id}/contactos[...] | clientes.consultar / clientes.modificar | ContactoService.* | Tipos TELEFONO/CORREO/WHATSAPP; baja lógica. |
| CU-02.05 | POST | /api/v1/clientes-prospectos/{id}/clasificacion | clientes.clasificar | ClienteProspectoService.clasificar | Validar transición vigente y version. |

### Catálogo
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-03.01 | GET | /api/v1/productos \| /servicios \| /paquetes | catalogo.consultar | Servicios de consulta por recurso | Paginación/filtros; no endpoint que mezcle entidades si no aporta valor. |
| CU-03.02 | GET/POST/PUT/PATCH | /api/v1/productos[/{id}][/estado] | Permisos granulares catalogo.productos.* | ProductoService.* | Baja lógica; código único. |
| CU-03.03 | GET/POST/PUT/PATCH | /api/v1/servicios[/{id}][/estado] | Permisos granulares catalogo.servicios.* | ServicioService.* | Servicio usa tarifa_base; no ListaPrecio. |
| CU-03.04 | GET/POST/PUT/PATCH | /api/v1/paquetes[/{id}][/estado] | Permisos granulares catalogo.paquetes.* | PaqueteService.* | Composición producto/servicio; precio global proviene de lista. |
| CU-03.04 | GET/PUT | /api/v1/paquetes/{id}/componentes | catalogo.paquetes.modificar | PaqueteService.actualizarComponentes | Cantidad > 0; no duplicados; transacción local. |
| CU-03.05 | GET/POST/PUT/PATCH | /api/v1/categorias[...] | catalogo.auxiliares.gestionar | CategoriaService.* | Ámbito PRODUCTO/SERVICIO. |
| CU-03.06 | GET/POST/PUT/PATCH | /api/v1/tipos-producto[...] | catalogo.auxiliares.gestionar | TipoProductoService.* | Baja lógica. |
| CU-03.07 | GET/POST/PUT/PATCH | /api/v1/colores[...] | catalogo.auxiliares.gestionar | ColorService.* | Baja lógica. |
| CU-03.08 | GET/POST/PUT/PATCH | /api/v1/listas-precios[...] | catalogo.precios.gestionar | ListaPrecioService.* | Vigencia, estado, porcentaje fuera de lista. |
| CU-03.09 | GET/PUT | /api/v1/listas-precios/{id}/precios | catalogo.precios.gestionar | ListaPrecioService.actualizarPrecios | Solo PRODUCTO o PAQUETE; SERVICIO rechazado. |

### Inventario
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-04.01 | GET | /api/v1/inventario/existencias | inventario.consultar | ExistenciaQueryService.buscar | Disponible = existencia física - reservas vigentes. |
| CU-04.02 | GET | /api/v1/inventario/existencias/productos/{idProducto} | inventario.consultar | ExistenciaQueryService.detalleProducto | Incluye límites, reservas y últimos movimientos. |
| CU-04.03 | GET | /api/v1/inventario/disponibilidad | inventario.disponibilidad.consultar | DisponibilidadService.consultarFutura | Query: producto, fechaInicio, fechaFin, cantidad. |
| CU-04.04 | PUT | /api/v1/inventario/limites/{idProducto} | inventario.gestionar | LimiteInventarioService.configurar | Enteros >0, máximo >= mínimo, version. |
| CU-04.05 | GET | /api/v1/inventario/alertas | inventario.alertas.consultar | AlertaInventarioQueryService.consultar | Read model derivado; sin tabla Alerta. |
| CU-04.06 | POST | /api/v1/inventario/entradas | inventario.gestionar | EntradaInventarioService.registrar | Idempotency-Key → clave_operacion; existencia + movimiento atómicos. |
| CU-04.07 | POST | /api/v1/inventario/salidas | inventario.gestionar | SalidaInventarioService.registrar | Permite parcial; activa reserva localmente. |
| CU-04.08 | POST | /api/v1/inventario/retornos | inventario.gestionar | RetornoInventarioService.registrar | Permite parcial; libera reserva al concluir según reglas. |
| CU-04.09 | POST | /api/v1/inventario/ajustes | inventario.gestionar | AjusteInventarioService.registrar | Justificación, usuario y trazabilidad obligatorios. |
| CU-04.10 | POST | /api/v1/inventario/cortes | inventario.cortes.gestionar | CorteFisicoService.iniciar | Snapshot de existencia; no modifica existencia. |
| CU-04.10 | PUT/POST | /api/v1/inventario/cortes/{id}/conteos \| /cerrar | inventario.cortes.gestionar | CorteFisicoService.* | Diferencias se corrigen por ajuste, no por cierre. |
| CU-04.11 | GET | /api/v1/inventario/movimientos | inventario.movimientos.consultar | MovimientoInventarioQueryService.buscar | Histórico inmutable. |
| CU-04.12 | GET | /api/v1/inventario/reservas | inventario.reservas.consultar | ReservaQueryService.buscar | Filtros por orden, estado, fechas. |
| CU-04.13 | INTERNAL POST | /internal/v1/reservas | Servicio autorizado | ReservaService.crearConfirmada | Comando idempotente desde Cotizaciones; unique por id_orden_externo. |
| CU-04.14 | LOCAL | SalidaInventarioService → ReservaService | inventario.gestionar | ReservaService.activar | No requiere endpoint independiente: forma parte de la salida. |
| CU-04.15 | INTERNAL POST | /internal/v1/reservas/ordenes/{idOrden}/liberar | Servicio autorizado | ReservaService.liberarPorOrden | Invocable por cancelación de Orden; retorno usa llamada local. |

### Cotizaciones
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-05.01 | GET | /api/v1/cotizaciones | cotizaciones.consultar | CotizacionQueryService.buscar | Filtros; vencidas ordenadas según regla vigente. |
| CU-05.02 | GET | /api/v1/cotizaciones/{id} | cotizaciones.consultar | CotizacionQueryService.detalle | Incluye versiones, elegida e historial. |
| CU-05.03 | POST | /api/v1/cotizaciones | cotizaciones.gestionar | CotizacionService.crear | Cliente externo válido; domicilio/evento pertenecen aquí. |
| CU-05.04 | POST/PUT | /api/v1/cotizaciones/{id}/versiones[/{idVersion}] | cotizaciones.gestionar | CotizacionVersionService.* | Solo BORRADOR editable. |
| CU-05.05 | POST | /api/v1/cotizaciones/{id}/versiones | cotizaciones.gestionar | CotizacionVersionService.recotizar | Request puede indicar versión origen; no altera historial. |
| CU-05.06 | GET | /api/v1/cotizaciones/{id}/versiones/{idVersion}/disponibilidad | cotizaciones.consultar | CotizacionAvailabilityService.consultar | Cliente REST a Inventario; informativa, no bloquea creación/envío. |
| CU-05.07 | GET | /api/v1/cotizaciones/{id}/versiones/{idVersion}/documento | cotizaciones.consultar | CotizacionDocumentService.generarPdf | Response application/pdf; no persistir binario por defecto. |
| CU-05.08 | POST | /api/v1/cotizaciones/{id}/versiones/{idVersion}/envios | cotizaciones.gestionar | CotizacionEnvioService.registrarEnvio | Cambia versión a ENVIADA y registra EnvioCotizacion. |
| CU-05.09 | POST | /api/v1/cotizaciones/{id}/seguimientos | cotizaciones.gestionar | CotizacionService.registrarSeguimiento | Persistir como evento de historial sin nueva entidad. |
| CU-05.10 | PUT | /api/v1/cotizaciones/{id}/version-elegida | cotizaciones.gestionar | CotizacionService.seleccionarVersion | Solo una elegida; version de concurrencia. |
| CU-05.11 | POST | /api/v1/cotizaciones/{id}/confirmar | cotizaciones.gestionar | CotizacionConfirmationOrchestrator.confirmar | Saga: Pagos + Inventario + Órdenes; Idempotency-Key y correlationId obligatorios. |
| CU-05.12 | POST | /api/v1/cotizaciones/{id}/cancelar | cotizaciones.gestionar | CotizacionService.cancelar | Estado terminal general; conservar versiones. |
| CU-05.13 | POST | /api/v1/cotizaciones/{id}/rechazar | cotizaciones.gestionar | CotizacionService.rechazar | Estado terminal general. |
| CU-05.14 | SCHEDULED | CotizacionExpirationJob | Interno | CotizacionService.vencerElegibles | No endpoint público normal; ejecución periódica e idempotente. |

### Órdenes de Servicio
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-06.01 | INTERNAL POST | /internal/v1/ordenes | Servicio autorizado | OrdenCommandService.generarDesdeCotizacion | Idempotente por cotización+versión; snapshot inmutable. |
| CU-06.02 | GET | /api/v1/ordenes | ordenes.consultar | OrdenQueryService.buscar | Paginación/filtros/alcance. |
| CU-06.03 | GET | /api/v1/ordenes/{id} | ordenes.detalle.consultar | OrdenQueryService.detalle | Snapshot + detalles + historial + referencias. |
| CU-06.04 | POST | /api/v1/ordenes/{id}/revision | ordenes.revisar | OrdenService.registrarRevisionVentas | No edita datos confirmados. |
| CU-06.05 | POST | /api/v1/ordenes/{id}/liberar-programacion | ordenes.revisar | OrdenService.liberarProgramacion | EN_REVISION_VENTAS → PENDIENTE_PROGRAMACION. |
| CU-06.06 | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | Servicio autorizado | OrdenStateService.aplicarHito | Hito PROGRAMACION_CONFIRMADA; origen Logística. |
| CU-06.07 | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | Servicio autorizado | OrdenStateService.aplicarHito | Hito PREPARACION_INICIADA. |
| CU-06.08 | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | Servicio autorizado | OrdenStateService.aplicarHito | Hito final según servicio/productos/inspección. |
| CU-06.09 | POST | /api/v1/ordenes/{id}/cancelar | ordenes.cancelar | OrdenCancellationOrchestrator.cancelar | Coordina liberación Inventario y cancelación Logística; idempotente. |
| CU-06.10 | EVENT | ORDEN_ESTADO_CAMBIADO | Interno | DomainEventPublisher.publish | Notificación/alerta no debe acoplar persistencia de Orden. |

### Logística
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-07.01 | GET | /api/v1/logistica/programaciones | logistica.consultar | ProgramacionLogisticaQueryService.buscar | Lista/calendario según filtros. |
| CU-07.02 | GET | /api/v1/logistica/mis-operaciones | logistica.asignadas / logistica.traslado | AsignacionLogisticaQueryService.misOperaciones | Backend aplica alcance por usuario; no filtrar solo en frontend. |
| CU-07.03 | POST | /api/v1/logistica/programaciones | logistica.gestionar | ProgramacionLogisticaService.programar | Al confirmar planeación envía hito a Órdenes. |
| CU-07.03 | POST | /api/v1/logistica/programaciones/{id}/reprogramar | logistica.gestionar | ProgramacionLogisticaService.reprogramar | Motivo obligatorio; optimistic locking. |
| CU-07.04 | PUT | /api/v1/logistica/programaciones/{id}/recursos | logistica.gestionar | ProgramacionLogisticaService.asignarRecursos | Vehículo/chofer/representante; validar conflictos. |
| CU-07.05 | POST/DELETE | /api/v1/logistica/programaciones/{id}/asignaciones[...] | logistica.gestionar | RutaLogisticaService.* | Programación actúa como contenedor de ruta combinada; no nueva entidad Ruta. |
| CU-07.06 | PUT | /api/v1/logistica/programaciones/{id}/orden-paradas | logistica.gestionar | RutaLogisticaService.ordenarParadas | Unicidad de orden_parada. |
| CU-07.07 | GET | /api/v1/logistica/programaciones/{id}/ruta | logistica.consultar | RutaLogisticaQueryService.detalle | Read model con órdenes, paradas y avance. |
| CU-07.08 | POST/PATCH | /api/v1/logistica/etapas/{id}/iniciar \| /avance | logistica.proceso.gestion | EtapaLogisticaService.* | Hito de preparación se comunica a Órdenes. |
| CU-07.09 | POST | /api/v1/logistica/etapas/{id}/evidencias | logistica.proceso.gestion | EtapaLogisticaService.registrarEvidencias | multipart/form-data o referencias pre-cargadas; exactamente 3. |
| CU-07.10 | POST | /api/v1/logistica/etapas/{id}/confirmar | logistica.proceso.gestion | EtapaLogisticaService.confirmar | Valida 3 evidencias + comentario + autorización. |
| CU-07.11 | POST | /api/v1/logistica/etapas/{id}/iniciar \| /confirmar | logistica.traslado | EtapaLogisticaService.* | Para TRASLADO registra fecha/hora real; no duración fija. |
| CU-07.12 | POST | /api/v1/logistica/incidencias | logistica.proceso.gestion / logistica.traslado | IncidenciaService.reportar | Tipo permitido según perfil; no bloquea operación. |
| CU-07.13 | POST | /api/v1/logistica/incidencias/{id}/seguimientos | logistica.gestionar | IncidenciaService.seguir | REPORTADA → EN_SEGUIMIENTO. |
| CU-07.13 | POST | /api/v1/logistica/incidencias/{id}/resolver | logistica.gestionar | IncidenciaService.resolver | EN_SEGUIMIENTO → RESUELTA; no reabrir. |

### Pagos
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-08.01 | GET | /api/v1/pagos | pagos.consultar | PagoQueryService.buscar | Incluye pagos y referencias; movimientos compensatorios consultables. |
| CU-08.02 | GET | /api/v1/cuentas-cobro/cotizaciones/{idCotizacion}/versiones/{idVersion} | pagos.consultar | CuentaCobroService.obtenerPorCotizacion | Calcula acumulado/saldo; no duplicar campos derivados. |
| CU-08.03 | POST | /api/v1/pagos | pagos.gestionar | PagoService.registrar | Idempotency-Key → clave_operacion; pago inmutable. |
| CU-08.04 | POST | /api/v1/pagos/{id}/compensaciones | pagos.gestionar | MovimientoCuentaService.compensar | Nuevo movimiento; no modifica/elimina pago original. |
| CU-08.05 | EVENT | IMPORTE_REQUERIDO_CUBIERTO | Interno | PagoCoverageService.evaluarYPublicar | Pagos informa el hecho; Cotizaciones decide confirmar. |

### Reportes
| CU | Tipo | URI/interfaz | Permiso | Service | Notas |
|---|---|---|---|---|---|
| CU-09.01 | GET | /api/v1/reportes/ventas | reportes.consultar | ReporteVentasService.generar | Compone fuentes propietarias; fecha de corte y filtros. |
| CU-09.02 | GET | /api/v1/reportes/clientes | reportes.consultar | ReporteClientesService.generar | Sin escritura en dominios fuente. |
| CU-09.03 | GET | /api/v1/reportes/cotizaciones | reportes.consultar | ReporteCotizacionesService.generar | Sin BD transaccional propia. |
| CU-09.04 | GET | /api/v1/reportes/inventario | reportes.consultar | ReporteInventarioService.generar | Consulta Inventario/Catálogo. |
| CU-09.05 | GET | /api/v1/reportes/{tipo}/exportacion | reportes.consultar | ReporteExportService.exportar | format=PDF\|XLSX\|CSV; no ampliar a otros reportes sin CU. |

## 7. Capacitación, soporte y plataforma
| CU | Construcción | Propietario | Condición |
|---|---|---|---|
| CU-10.01 | GET /api/v1/documentacion/manual-usuario | Capacidad de contenido | Puede resolverse como archivo versionado; sin BD obligatoria. |
| CU-10.02 | GET /api/v1/documentacion/manual-tecnico | documentacion.tecnica.consultar | Archivo/documentación versionada. |
| CU-10.03 | Entorno/perfil de capacitación | Plataforma | Debe aislar datos productivos; no es CRUD de negocio. |
| CU-10.04 | POST /api/v1/soporte/retroalimentacion | Soporte | Bloqueado: las 47 tablas actuales no contienen persistencia para retroalimentación. |
| CU-10.05 | GET/POST /api/v1/soporte/solicitudes | Soporte | Bloqueado: requiere decisión de entidad/BD/retención. |
| CU-11.01 | Configuración en mr-seguridad-service | Seguridad | Implementado mediante ConfiguracionSistema. |
| CU-11.02 | POST /api/v1/plataforma/intercambio/importaciones | Plataforma | Validar recurso, permisos, formato, duplicados/idempotencia; no acceso directo cross-DB. |
| CU-11.03 | GET /api/v1/plataforma/intercambio/exportaciones | Plataforma | Exportación autorizada por recurso. |
| CU-11.04 | Actuator + consulta técnica autorizada | Plataforma/Seguridad | No exponer logs sensibles; EventoAuditoria no sustituye logs técnicos. |
| CU-11.05 | Runbook/job de backup | Infraestructura | No se implementa como endpoint público de JPA. |
| CU-11.06 | Runbook/job de restore | Infraestructura | Debe cumplir RPO/MTTR y validación posterior. |
| CU-11.07 | ReconciliationJob / event replay | Integración | Reintento idempotente de operaciones pendientes; mecanismo durable pendiente. |

## 8. Buenas prácticas
- **Inyección:** Constructor injection; campos final. No @Autowired sobre atributos.
- **DTO:** Preferir records de Java 21 para request/response inmutables cuando sea apropiado. No exponer entidades JPA.
- **Lombok:** No usar @Data en entidades JPA. Usar @Getter/@Setter de forma controlada; equals/hashCode no debe recorrer relaciones.
- **Dinero:** BigDecimal; nunca double/float. La regla de redondeo se mantiene explícita y no se inventa si el CU no la define.
- **Estados:** Enums Java + @Enumerated(EnumType.STRING) sobre columnas VARCHAR/CHECK.
- **Concurrencia:** @Version Long en todas las entidades que poseen columna version. El request de actualización incluye version.
- **Fechas:** LocalDate/LocalTime para fecha/hora de evento; timestamps técnicos serializados ISO-8601. Evitar java.util.Date en código nuevo.
- **Transacciones:** @Transactional en Service; readOnly=true en consultas. Evitar llamadas remotas mientras una transacción mantiene locks, salvo necesidad justificada.
- **JPA:** Relaciones internas LAZY por defecto; no CascadeType.ALL indiscriminado; evitar relaciones bidireccionales innecesarias y N+1.
- **Referencias externas:** Long/string escalar; nunca @ManyToOne hacia otra BD/microservicio.
- **Históricos:** EventoAuditoria, MovimientoInventario, EnvioCotizacion, Historial*, AplicacionPago, MovimientoCuenta y SeguimientoIncidencia son append-only desde la capa de servicio.
- **Bajas:** Usar activo/estado y operaciones PATCH; no DELETE físico cuando la regla exige trazabilidad.
- **Logging:** SLF4J; no registrar contraseñas, tokens, PII completa, comprobantes o fotos. Propagar correlationId.
- **Errores:** Excepciones de dominio específicas; no catch(Exception) como control normal.
- **Configuración:** @ConfigurationProperties; URLs/credenciales/timeouts mediante variables/configuración, nunca hardcode.
- **Compatibilidad:** Cambios REST aditivos por defecto. Un campo/endpoint no se elimina sin deprecación y versión mayor del contrato.

## 9. Confirmación distribuida
La confirmación de cotización se implementa mediante `CotizacionConfirmationOrchestrator`, con validación de Pagos, reserva en Inventario, generación de Orden y confirmación local. Todos los pasos y compensaciones deben ser idempotentes. La durabilidad ante caída requiere aprobar Saga log/Outbox o mecanismo equivalente.

## 10. Brechas
| Dominio | Brecha | Impacto |
|---|---|---|
| Seguridad | Credenciales, hash de contraseña, emisión/renovación/revocación de token y persistencia de sesión/logout. | Bloquea CU-01.01/01.02 y reset password. |
| Clientes | Aceptación de privacidad requerida por CU-02.02 no está representada actualmente en mr_clientes. | Definir atributos exactos antes de Entity/DDL final. |
| Catálogo | Los CU manejan imagen; las tablas no contienen referencia de imagen. | Definir almacenamiento y referencia antes de cerrar DTO/product persistence. |
| Pagos | CU-08.03 admite comprobante opcional; pago no tiene columna de referencia. | Definir FileStoragePort + persistencia de referencia. |
| Integración | Saga/Outbox durable no tiene tabla/tecnología aprobada. | Bloquea garantía de recuperación de CU-05.11 en producción. |
| Soporte | Retroalimentación y solicitudes de soporte carecen de entidad/BD. | Bloquea persistencia CU-10.04/10.05. |
| Servicio-servicio | Identidad/autorización interna no está cerrada. | Definir OAuth2/JWT interno/mTLS antes de exponer /internal/v1 en producción. |
| Notificaciones | Hay CU de alertas, pero no se ha cerrado almacenamiento/canales/read-state. | Mantener como evento/capacidad hasta decisión. |

## 11. Trazabilidad CU
| CU | Caso | Propietario | Tipo | Interfaz | Componente |
|---|---|---|---|---|---|
| CU-01.01 | Autenticar usuario | Seguridad / Administración | POST | /api/v1/auth/login | AuthenticationService.authenticate |
| CU-01.02 | Cerrar sesión | Seguridad / Administración | POST | /api/v1/auth/logout | AuthenticationService.logout |
| CU-01.03 | Administrar usuarios | Seguridad / Administración | GET | /api/v1/usuarios | UsuarioService.buscar |
| CU-01.04 | Administrar roles | Seguridad / Administración | GET | /api/v1/roles | RolService.buscar |
| CU-01.05 | Administrar el catálogo de permisos | Seguridad / Administración | GET | /api/v1/permisos | PermisoService.buscar |
| CU-01.06 | Asignar roles y permisos a usuarios | Seguridad / Administración | PUT | /api/v1/usuarios/{id}/rol | UsuarioService.asignarRol |
| CU-01.07 | Consultar la matriz de acceso | Seguridad / Administración | GET | /api/v1/matriz-acceso | AccessMatrixService.consultar |
| CU-01.08 | Consultar la bitácora de accesos y operaciones críticas | Seguridad / Administración | GET | /api/v1/auditoria | AuditoriaService.buscar |
| CU-02.01 | Consultar y buscar clientes y prospectos | Clientes / Prospectos | GET | /api/v1/clientes-prospectos | ClienteProspectoService.buscar |
| CU-02.02 | Registrar prospecto | Clientes / Prospectos | POST | /api/v1/clientes-prospectos | ClienteProspectoService.registrarProspecto |
| CU-02.03 | Consultar el detalle de cliente o prospecto | Clientes / Prospectos | GET | /api/v1/clientes-prospectos/{id} | ClienteProspectoService.obtenerDetalle |
| CU-02.04 | Actualizar información de cliente o prospecto | Clientes / Prospectos | PUT | /api/v1/clientes-prospectos/{id} | ClienteProspectoService.actualizar |
| CU-02.05 | Clasificar el registro como Prospecto, Cliente o Prospecto Revisado | Clientes / Prospectos | POST | /api/v1/clientes-prospectos/{id}/clasificacion | ClienteProspectoService.clasificar |
| CU-03.01 | Consultar el catálogo | Catálogo | GET | /api/v1/productos \| /servicios \| /paquetes | Servicios de consulta por recurso |
| CU-03.02 | Administrar productos | Catálogo | GET/POST/PUT/PATCH | /api/v1/productos[/{id}][/estado] | ProductoService.* |
| CU-03.03 | Administrar servicios | Catálogo | GET/POST/PUT/PATCH | /api/v1/servicios[/{id}][/estado] | ServicioService.* |
| CU-03.04 | Administrar paquetes | Catálogo | GET/POST/PUT/PATCH | /api/v1/paquetes[/{id}][/estado] | PaqueteService.* |
| CU-03.05 | Administrar categorías | Catálogo | GET/POST/PUT/PATCH | /api/v1/categorias[...] | CategoriaService.* |
| CU-03.06 | Administrar tipos de producto | Catálogo | GET/POST/PUT/PATCH | /api/v1/tipos-producto[...] | TipoProductoService.* |
| CU-03.07 | Administrar colores | Catálogo | GET/POST/PUT/PATCH | /api/v1/colores[...] | ColorService.* |
| CU-03.08 | Administrar listas de precios | Catálogo | GET/POST/PUT/PATCH | /api/v1/listas-precios[...] | ListaPrecioService.* |
| CU-03.09 | Asignar precios de lista a productos y paquetes | Catálogo | GET/PUT | /api/v1/listas-precios/{id}/precios | ListaPrecioService.actualizarPrecios |
| CU-04.01 | Consultar existencias | Inventario | GET | /api/v1/inventario/existencias | ExistenciaQueryService.buscar |
| CU-04.02 | Consultar el detalle de existencia por producto | Inventario | GET | /api/v1/inventario/existencias/productos/{idProducto} | ExistenciaQueryService.detalleProducto |
| CU-04.03 | Consultar disponibilidad futura | Inventario | GET | /api/v1/inventario/disponibilidad | DisponibilidadService.consultarFutura |
| CU-04.04 | Configurar mínimos y máximos | Inventario | PUT | /api/v1/inventario/limites/{idProducto} | LimiteInventarioService.configurar |
| CU-04.05 | Consultar alertas de mínimos y máximos | Inventario | GET | /api/v1/inventario/alertas | AlertaInventarioQueryService.consultar |
| CU-04.06 | Registrar entrada de inventario | Inventario | POST | /api/v1/inventario/entradas | EntradaInventarioService.registrar |
| CU-04.07 | Registrar salida asociada a una orden | Inventario | POST | /api/v1/inventario/salidas | SalidaInventarioService.registrar |
| CU-04.08 | Registrar retorno asociado a una orden | Inventario | POST | /api/v1/inventario/retornos | RetornoInventarioService.registrar |
| CU-04.09 | Registrar ajuste autorizado | Inventario | POST | /api/v1/inventario/ajustes | AjusteInventarioService.registrar |
| CU-04.10 | Registrar corte físico | Inventario | POST | /api/v1/inventario/cortes | CorteFisicoService.iniciar |
| CU-04.11 | Consultar historial de movimientos | Inventario | GET | /api/v1/inventario/movimientos | MovimientoInventarioQueryService.buscar |
| CU-04.12 | Consultar reservas asociadas a órdenes | Inventario | GET | /api/v1/inventario/reservas | ReservaQueryService.buscar |
| CU-04.13 | Crear reserva al confirmar una cotización | Inventario | INTERNAL POST | /internal/v1/reservas | ReservaService.crearConfirmada |
| CU-04.14 | Activar reserva al registrar la salida | Inventario | LOCAL | SalidaInventarioService → ReservaService | ReservaService.activar |
| CU-04.15 | Liberar reserva por retorno o cancelación | Inventario | INTERNAL POST | /internal/v1/reservas/ordenes/{idOrden}/liberar | ReservaService.liberarPorOrden |
| CU-05.01 | Consultar y buscar cotizaciones | Cotizaciones | GET | /api/v1/cotizaciones | CotizacionQueryService.buscar |
| CU-05.02 | Consultar detalle e historial de versiones | Cotizaciones | GET | /api/v1/cotizaciones/{id} | CotizacionQueryService.detalle |
| CU-05.03 | Crear cotización | Cotizaciones | POST | /api/v1/cotizaciones | CotizacionService.crear |
| CU-05.04 | Crear o editar una versión de cotización | Cotizaciones | POST/PUT | /api/v1/cotizaciones/{id}/versiones[/{idVersion}] | CotizacionVersionService.* |
| CU-05.05 | Recotizar mediante una nueva versión | Cotizaciones | POST | /api/v1/cotizaciones/{id}/versiones | CotizacionVersionService.recotizar |
| CU-05.06 | Consultar disponibilidad informativa | Cotizaciones | GET | /api/v1/cotizaciones/{id}/versiones/{idVersion}/disponibilidad | CotizacionAvailabilityService.consultar |
| CU-05.07 | Generar cotización en PDF | Cotizaciones | GET | /api/v1/cotizaciones/{id}/versiones/{idVersion}/documento | CotizacionDocumentService.generarPdf |
| CU-05.08 | Enviar una versión al cliente | Cotizaciones | POST | /api/v1/cotizaciones/{id}/versiones/{idVersion}/envios | CotizacionEnvioService.registrarEnvio |
| CU-05.09 | Registrar seguimiento de cotización | Cotizaciones | POST | /api/v1/cotizaciones/{id}/seguimientos | CotizacionService.registrarSeguimiento |
| CU-05.10 | Seleccionar la versión elegida por el cliente | Cotizaciones | PUT | /api/v1/cotizaciones/{id}/version-elegida | CotizacionService.seleccionarVersion |
| CU-05.11 | Confirmar cotización después del pago requerido | Cotizaciones | POST | /api/v1/cotizaciones/{id}/confirmar | CotizacionConfirmationOrchestrator.confirmar |
| CU-05.12 | Cancelar cotización | Cotizaciones | POST | /api/v1/cotizaciones/{id}/cancelar | CotizacionService.cancelar |
| CU-05.13 | Rechazar cotización | Cotizaciones | POST | /api/v1/cotizaciones/{id}/rechazar | CotizacionService.rechazar |
| CU-05.14 | Marcar cotización como vencida | Cotizaciones | SCHEDULED | CotizacionExpirationJob | CotizacionService.vencerElegibles |
| CU-06.01 | Generar orden desde una cotización confirmada | Órdenes de Servicio | INTERNAL POST | /internal/v1/ordenes | OrdenCommandService.generarDesdeCotizacion |
| CU-06.02 | Consultar y buscar órdenes de servicio | Órdenes de Servicio | GET | /api/v1/ordenes | OrdenQueryService.buscar |
| CU-06.03 | Consultar detalle de la orden | Órdenes de Servicio | GET | /api/v1/ordenes/{id} | OrdenQueryService.detalle |
| CU-06.04 | Revisar la orden por parte de Ventas | Órdenes de Servicio | POST | /api/v1/ordenes/{id}/revision | OrdenService.registrarRevisionVentas |
| CU-06.05 | Liberar la orden como Pendiente de programación | Órdenes de Servicio | POST | /api/v1/ordenes/{id}/liberar-programacion | OrdenService.liberarProgramacion |
| CU-06.06 | Marcar la orden como Programada por un hito logístico | Órdenes de Servicio | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | OrdenStateService.aplicarHito |
| CU-06.07 | Marcar la orden En ejecución por inicio de preparación | Órdenes de Servicio | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | OrdenStateService.aplicarHito |
| CU-06.08 | Marcar la orden como Realizada | Órdenes de Servicio | INTERNAL POST | /internal/v1/ordenes/{id}/hitos | OrdenStateService.aplicarHito |
| CU-06.09 | Cancelar la orden de servicio | Órdenes de Servicio | POST | /api/v1/ordenes/{id}/cancelar | OrdenCancellationOrchestrator.cancelar |
| CU-06.10 | Generar alertas por cambios relevantes de estado | Órdenes de Servicio | EVENT | ORDEN_ESTADO_CAMBIADO | DomainEventPublisher.publish |
| CU-07.01 | Consultar programación logística | Logística | GET | /api/v1/logistica/programaciones | ProgramacionLogisticaQueryService.buscar |
| CU-07.02 | Consultar operaciones asignadas | Logística | GET | /api/v1/logistica/mis-operaciones | AsignacionLogisticaQueryService.misOperaciones |
| CU-07.03 | Programar o reprogramar una orden | Logística | POST | /api/v1/logistica/programaciones | ProgramacionLogisticaService.programar |
| CU-07.04 | Asignar vehículo, chofer y representante | Logística | PUT | /api/v1/logistica/programaciones/{id}/recursos | ProgramacionLogisticaService.asignarRecursos |
| CU-07.05 | Crear y administrar una ruta combinada | Logística | POST/DELETE | /api/v1/logistica/programaciones/{id}/asignaciones[...] | RutaLogisticaService.* |
| CU-07.06 | Ordenar manualmente las paradas | Logística | PUT | /api/v1/logistica/programaciones/{id}/orden-paradas | RutaLogisticaService.ordenarParadas |
| CU-07.07 | Consultar la vista general de ruta | Logística | GET | /api/v1/logistica/programaciones/{id}/ruta | RutaLogisticaQueryService.detalle |
| CU-07.08 | Iniciar y registrar avances de una fase logística | Logística | POST/PATCH | /api/v1/logistica/etapas/{id}/iniciar \| /avance | EtapaLogisticaService.* |
| CU-07.09 | Registrar evidencias de una fase | Logística | POST | /api/v1/logistica/etapas/{id}/evidencias | EtapaLogisticaService.registrarEvidencias |
| CU-07.10 | Confirmar la conclusión de una fase | Logística | POST | /api/v1/logistica/etapas/{id}/confirmar | EtapaLogisticaService.confirmar |
| CU-07.11 | Registrar carga, inicio y término de traslado | Logística | POST | /api/v1/logistica/etapas/{id}/iniciar \| /confirmar | EtapaLogisticaService.* |
| CU-07.12 | Reportar una incidencia logística | Logística | POST | /api/v1/logistica/incidencias | IncidenciaService.reportar |
| CU-07.13 | Dar seguimiento y resolver una incidencia | Logística | POST | /api/v1/logistica/incidencias/{id}/seguimientos | IncidenciaService.seguir |
| CU-08.01 | Consultar pagos registrados | Pagos | GET | /api/v1/pagos | PagoQueryService.buscar |
| CU-08.02 | Consultar pagos acumulados y saldo de una cotización | Pagos | GET | /api/v1/cuentas-cobro/cotizaciones/{idCotizacion}/versiones/{idVersion} | CuentaCobroService.obtenerPorCotizacion |
| CU-08.03 | Registrar pago manual | Pagos | POST | /api/v1/pagos | PagoService.registrar |
| CU-08.04 | Registrar movimiento compensatorio | Pagos | POST | /api/v1/pagos/{id}/compensaciones | MovimientoCuentaService.compensar |
| CU-08.05 | Notificar a Cotizaciones cuando se cubra el importe requerido | Pagos | EVENT | IMPORTE_REQUERIDO_CUBIERTO | PagoCoverageService.evaluarYPublicar |
| CU-09.01 | Generar reporte de ventas | Reportes | GET | /api/v1/reportes/ventas | ReporteVentasService.generar |
| CU-09.02 | Generar reporte de clientes | Reportes | GET | /api/v1/reportes/clientes | ReporteClientesService.generar |
| CU-09.03 | Generar reporte de cotizaciones | Reportes | GET | /api/v1/reportes/cotizaciones | ReporteCotizacionesService.generar |
| CU-09.04 | Generar reporte de inventario | Reportes | GET | /api/v1/reportes/inventario | ReporteInventarioService.generar |
| CU-09.05 | Exportar reporte en PDF, Excel o CSV | Reportes | GET | /api/v1/reportes/{tipo}/exportacion | ReporteExportService.exportar |
| CU-10.01 | Consultar manual de usuario | Capacidad de contenido | CAPACIDAD | GET /api/v1/documentacion/manual-usuario | Puede resolverse como archivo versionado; sin BD obligatoria. |
| CU-10.02 | Consultar manual técnico | documentacion.tecnica.consultar | CAPACIDAD | GET /api/v1/documentacion/manual-tecnico | Archivo/documentación versionada. |
| CU-10.03 | Acceder al modo piloto o de capacitación | Plataforma | CAPACIDAD | Entorno/perfil de capacitación | Debe aislar datos productivos; no es CRUD de negocio. |
| CU-10.04 | Registrar retroalimentación del piloto | Soporte | CAPACIDAD | POST /api/v1/soporte/retroalimentacion | Bloqueado: las 47 tablas actuales no contienen persistencia para retroalimentación. |
| CU-10.05 | Registrar y consultar solicitudes de soporte | Soporte | CAPACIDAD | GET/POST /api/v1/soporte/solicitudes | Bloqueado: requiere decisión de entidad/BD/retención. |
| CU-11.01 | Administrar parámetros generales del sistema | Seguridad / Administración | GET/PUT | /api/v1/configuracion[/{clave}] | ConfiguracionService.* |
| CU-11.02 | Importar información mediante CSV | Plataforma | CAPACIDAD | POST /api/v1/plataforma/intercambio/importaciones | Validar recurso, permisos, formato, duplicados/idempotencia; no acceso directo cross-DB. |
| CU-11.03 | Exportar información mediante CSV | Plataforma | CAPACIDAD | GET /api/v1/plataforma/intercambio/exportaciones | Exportación autorizada por recurso. |
| CU-11.04 | Consultar registros técnicos y eventos de diagnóstico | Plataforma/Seguridad | CAPACIDAD | Actuator + consulta técnica autorizada | No exponer logs sensibles; EventoAuditoria no sustituye logs técnicos. |
| CU-11.05 | Ejecutar respaldo de información | Infraestructura | CAPACIDAD | Runbook/job de backup | No se implementa como endpoint público de JPA. |
| CU-11.06 | Restaurar información respaldada | Infraestructura | CAPACIDAD | Runbook/job de restore | Debe cumplir RPO/MTTR y validación posterior. |
| CU-11.07 | Sincronizar operaciones pendientes después de recuperar la comunicación | Integración | CAPACIDAD | ReconciliationJob / event replay | Reintento idempotente de operaciones pendientes; mecanismo durable pendiente. |


---

## 12. Especificación concreta del proceso de construcción en monorepo

### 12.1 Documento de contexto y regla de precedencia

El **contexto técnico, arquitectónico, contractual y de trazabilidad** para la construcción se encuentra en este documento: `Mesa_Regia_Especificacion_Construccion_Microservicios.md`, particularmente en las secciones 1 a 11.

La presente sección convierte ese contexto en un **proceso ejecutable de construcción**. No sustituye los contratos, reglas de negocio, permisos, brechas ni trazabilidad CU ya definidos. En caso de discrepancia durante la implementación, se aplicará el siguiente orden de precedencia:

1. Decisiones funcionales cerradas del proyecto y casos de uso vigentes.
2. Propiedad de datos y DDL aprobado de cada base.
3. Contratos y reglas de las secciones 1 a 11 de este documento.
4. Proceso de construcción de las secciones 12 en adelante.
5. Decisiones técnicas locales de implementación que no alteren lo anterior.

No se modificará silenciosamente un contrato, entidad, estado, permiso o dependencia para facilitar la codificación.

### 12.2 Consistencia con la especificación previa

La revisión entre la especificación existente y el proceso de construcción definido posteriormente **no identifica contradicciones arquitectónicas que impidan la construcción**. Se normalizan los siguientes puntos para evitar ambigüedad:

| Punto | Situación encontrada | Decisión normalizada |
|---|---|---|
| Nombre de módulos | En explicaciones se usaron nombres abreviados como `inventario-service`. | Los artefactos oficiales usarán los nombres definidos en la sección 4: `mr-inventario-service`, `mr-catalogo-service`, etc. |
| Orden Pagos/Cotizaciones | En propuestas previas aparecieron ambos órdenes. | Para la construcción local completa se construye **Pagos antes de Cotizaciones**; Cotizaciones puede modelar antes sus puertos, pero la integración de confirmación se realiza después de tener Pagos, Inventario y Órdenes funcionales. |
| Parent Maven e independencia | Un parent común puede sugerir una versión única para todo el sistema. | El parent controla la **línea tecnológica**; cada microservicio conserva artefacto y versión funcional propios. No se usarán dependencias Maven directas entre microservicios. |
| Flyway | Estaba descrito como recomendación. | Se establece como **requerido para la evolución del esquema** a partir de la baseline aprobada. Hibernate usará `ddl-auto=validate`. |
| Integraciones distribuidas | Saga/Outbox están definidos, pero su infraestructura física continúa pendiente. | Los puertos e interfaces se construyen desde el inicio; broker, persistencia durable y compensaciones finales se incorporan en la etapa de integración sin acoplar la lógica de dominio. |

Estas normalizaciones no modifican los casos de uso ni la propiedad de las ocho bases de datos.

## 13. Estructura física del monorepo

La raíz del repositorio backend se construirá con la siguiente estructura mínima:

```text
mesa-regia-backend/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/
├── .gitignore
├── README.md
├── docs/
├── mr-seguridad-service/
│   └── pom.xml
├── mr-catalogo-service/
│   └── pom.xml
├── mr-clientes-service/
│   └── pom.xml
├── mr-inventario-service/
│   └── pom.xml
├── mr-pagos-service/
│   └── pom.xml
├── mr-cotizaciones-service/
│   └── pom.xml
├── mr-ordenes-service/
│   └── pom.xml
├── mr-logistica-service/
│   └── pom.xml
└── mr-reportes-service/
    └── pom.xml
```

El repositorio es único, pero cada módulo Spring Boot constituye una unidad ejecutable, testeable, versionable y desplegable de manera independiente.

### 13.1 Reglas del `pom.xml` raíz

El `pom.xml` raíz tendrá `packaging=pom` y funcionará como **agregador y parent técnico**. Debe centralizar:

- Java 21.
- versión baseline de Spring Boot;
- `dependencyManagement` y `pluginManagement`;
- plugins de compilación y pruebas;
- Maven Enforcer cuando se incorpore;
- configuración común de calidad;
- lista de módulos del reactor.

No contendrá reglas de negocio, entidades, DTO, repositories ni configuración funcional de un microservicio.

### 13.2 Reglas de los `pom.xml` de microservicio

Cada microservicio:

- tendrá su propio `artifactId`;
- podrá mantener una versión funcional independiente;
- declarará únicamente los starters y librerías que utilice;
- producirá su propio `.jar` ejecutable;
- no dependerá mediante Maven de otro microservicio del repositorio;
- se integrará con otros servicios mediante HTTP/eventos a través de puertos/adapters.

Ejemplo conceptual de versiones coexistentes:

```text
mr-catalogo-service      1.2.0
mr-inventario-service    1.4.0
mr-cotizaciones-service  1.1.0
```

El parent Maven puede conservar una versión técnica distinta y no obliga a que los servicios compartan versión funcional.

## 14. Foundation del monorepo

La construcción inicia obligatoriamente con una **Foundation común** antes de implementar casos de uso.

### 14.1 Actividades

1. Crear repositorio y Maven Wrapper.
2. Crear `pom.xml` raíz agregador/parent.
3. Crear los nueve módulos definidos en la sección 4.
4. Crear clase `Application` de cada servicio.
5. Configurar `application.yml` base por servicio.
6. Configurar perfiles `local`, `test` y `prod`.
7. Configurar MariaDB JDBC y datasource exclusivo por servicio.
8. Configurar Flyway por módulo.
9. Configurar Hibernate con `ddl-auto=validate`.
10. Incorporar Spring Security base.
11. Incorporar manejo homogéneo de errores.
12. Incorporar `X-Correlation-Id` y logging SLF4J.
13. Incorporar Actuator y health checks.
14. Incorporar SpringDoc OpenAPI.
15. Definir convención de paquetes.
16. Configurar pruebas base y Testcontainers MariaDB para integración donde aplique.

### 14.2 Criterio de salida de Foundation

Foundation se considera terminada cuando:

```bash
./mvnw clean verify
```

termina correctamente desde la raíz y, adicionalmente, cada microservicio puede iniciar de forma independiente con su configuración local y su propia base o infraestructura de prueba.

No se requiere que todos los casos de uso estén implementados para cumplir este criterio.

## 15. Esqueleto estándar de cada microservicio

Cada módulo se construirá con la siguiente estructura lógica mínima:

```text
src/main/java/mx/com/mesaregia/<dominio>/
├── api/
│   ├── controller/
│   ├── request/
│   ├── response/
│   └── assembler/
├── application/
│   ├── service/
│   └── service/impl/
├── domain/
│   ├── entity/
│   └── enums/
├── repository/
├── mapper/
├── integration/
│   ├── client/
│   ├── dto/
│   ├── event/
│   └── file/
├── scheduler/
├── security/
├── exception/
└── config/
```

La regla de dependencia interna permanece:

```text
Controller → Service → Repository → BD propia
                  ↓
           Integration Port
                  ↓
               Adapter
```

No se permite `Controller → Repository` ni relaciones JPA hacia otra base.

## 16. Orden oficial de construcción

La secuencia de construcción del monorepo será:

| Etapa | Unidad | Objetivo |
|---:|---|---|
| 0 | Foundation | Crear reactor Maven, convenciones y capacidades técnicas comunes. |
| 1 | `mr-seguridad-service` | Administración, permisos, auditoría y base de Spring Security; autenticación completa queda condicionada a la decisión de credenciales/sesión. |
| 2 | `mr-catalogo-service` | Proveer catálogo y listas de precios a consumidores posteriores. |
| 3 | `mr-clientes-service` | Proveer identidad comercial y contactos. |
| 4 | `mr-inventario-service` | Proveer existencias, disponibilidad, movimientos y reservas. |
| 5 | `mr-pagos-service` | Proveer cuenta de cobro, pagos, compensaciones y cobertura requerida. |
| 6 | `mr-cotizaciones-service` | Construir cotización/versiones y preparar la orquestación de confirmación. |
| 7 | `mr-ordenes-service` | Construir generación interna, snapshots, estados e hitos. |
| 8 | `mr-logistica-service` | Construir programación, ejecución, evidencias e incidencias. |
| 9 | `mr-reportes-service` | Componer consultas de los servicios propietarios sin BD transaccional propia. |
| 10 | Integración distribuida | Conectar clientes internos, Saga, eventos/Outbox, reconciliación e identidad servicio-servicio. |
| 11 | Hardening | Seguridad, resiliencia, performance, observabilidad, pruebas de contrato y validación integral. |

La secuencia define el orden de cierre de unidades; no impide que se preparen interfaces o adapters de un consumidor antes de terminar su proveedor.

## 17. Construcción vertical por microservicio y caso de uso

No se construirán todas las capas de todos los servicios de manera horizontal. Cada microservicio se desarrolla como una **unidad vertical completa**, y dentro de él cada caso de uso se implementa de extremo a extremo.

Para cada CU se aplicará la siguiente secuencia:

1. Revisar el CU, permiso, precondiciones, reglas y criterios de aceptación.
2. Confirmar entidades/tablas propietarias y referencias externas.
3. Confirmar endpoint, evento, job u operación interna según la sección 6/11.
4. Incorporar o validar migración Flyway requerida.
5. Implementar/ajustar entidades JPA.
6. Implementar repositories necesarios.
7. Crear Request DTO y Response DTO.
8. Crear mapper explícito.
9. Implementar Service/caso de uso y transacción local.
10. Implementar puertos de integración cuando existan dependencias externas.
11. Implementar Controller o adapter de entrada correspondiente.
12. Incorporar HATEOAS/HAL-FORMS cuando aplique.
13. Aplicar Spring Security y permiso real del frontend.
14. Documentar OpenAPI.
15. Implementar manejo de errores de dominio.
16. Implementar idempotencia y concurrencia cuando corresponda.
17. Crear pruebas unitarias.
18. Crear pruebas de repository/integración MariaDB cuando corresponda.
19. Crear pruebas de Controller/contrato.
20. Validar el criterio de aceptación del CU.
21. Ejecutar `verify` del módulo.
22. Ejecutar `verify` raíz al cerrar un conjunto significativo de CU.

Un endpoint no se considera terminado si solo compila o persiste datos; debe satisfacer el flujo completo del CU.

## 18. Reglas para dependencias entre microservicios durante la construcción

Cuando un consumidor necesite un servicio aún no concluido:

1. se define primero un **puerto** en el consumidor;
2. se define el DTO de integración independiente del DTO público del proveedor;
3. se implementa un adapter temporal de prueba/stub cuando sea necesario;
4. el Service depende del puerto, no del cliente HTTP concreto;
5. el adapter real se incorpora cuando el proveedor esté disponible;
6. se agregan pruebas de contrato antes de retirar el stub.

Ejemplo:

```text
CotizacionAvailabilityService
        ↓
InventoryAvailabilityPort
        ↓
RestInventoryAvailabilityAdapter
        ↓
mr-inventario-service
```

No se copiarán entidades ni repositories entre módulos para resolver dependencias temporales.

## 19. Migraciones de base de datos

Cada microservicio será propietario exclusivo de sus migraciones Flyway:

```text
mr-inventario-service/
└── src/main/resources/db/migration/
    ├── V1__baseline_inventario.sql
    ├── V2__indice_reservas.sql
    └── V3__ajuste_movimiento.sql
```

Reglas:

- `V1` reflejará la baseline aprobada del dominio correspondiente.
- una migración aplicada no se reescribe; un ajuste nuevo genera una nueva versión;
- un servicio no incluirá migraciones sobre la BD de otro servicio;
- Hibernate validará el esquema, no lo modificará;
- cualquier cambio que altere contrato o caso de uso debe actualizar también documentación y pruebas.

## 20. Comandos oficiales de construcción y validación

### 20.1 Todo el monorepo

```bash
./mvnw clean verify
```

### 20.2 Un microservicio

```bash
./mvnw -pl mr-inventario-service test
```

### 20.3 Microservicio y módulos Maven requeridos por el reactor

```bash
./mvnw -pl mr-inventario-service -am clean verify
```

Dado que no se permitirán dependencias Maven de negocio entre microservicios, `-am` se utilizará principalmente para componentes técnicos que pudieran existir en el reactor y no como mecanismo de acoplamiento entre dominios.

### 20.4 Ejecución local

```bash
./mvnw -pl mr-inventario-service spring-boot:run
```

La ejecución local deberá usar configuración externalizada; las URLs, contraseñas y secretos no se hardcodean.

## 21. Estrategia Git dentro del monorepo

### 21.1 Ramas

Se usarán ramas cortas orientadas a capacidad o CU, por ejemplo:

```text
feature/inventario-consulta-existencias
feature/catalogo-lista-precios
feature/cotizaciones-versiones
fix/logistica-reprogramacion
```

No se mantendrán ramas permanentes por microservicio.

### 21.2 Commits

Los commits identificarán el dominio afectado:

```text
feat(inventario): implementar consulta de existencias
feat(cotizaciones): crear versión de cotización
fix(catalogo): validar vigencia de lista de precios
test(pagos): cubrir registro idempotente
```

### 21.3 Regla de retrabajo

Antes de implementar un cambio se revisarán las actividades posteriores conocidas. Si una etapa posterior reemplaza o elimina una modificación, no se implementará anticipadamente el cambio que será descartado. Se prioriza una secuencia que reduzca retrabajo y mantenga bloques de código coherentes.

## 22. CI/CD selectivo para monorepo

El pipeline deberá detectar rutas modificadas y ejecutar validación selectiva.

Reglas mínimas:

- cambio en `mr-inventario-service/**` → compilar/probar Inventario;
- cambio en `mr-catalogo-service/**` → compilar/probar Catálogo;
- cambio en varios servicios → probar todos los afectados;
- cambio en `pom.xml` raíz, parent, wrapper o configuración común → ejecutar `./mvnw clean verify` completo;
- antes de integrar a la rama principal deberá existir al menos una validación integral del reactor.

Cada microservicio generará artefacto propio y podrá desplegarse de manera independiente.

## 23. Versionado y artefactos

El monorepo no implica release único.

Cada servicio producirá:

```text
mr-seguridad-service-<version>.jar
mr-catalogo-service-<version>.jar
mr-clientes-service-<version>.jar
mr-inventario-service-<version>.jar
mr-pagos-service-<version>.jar
mr-cotizaciones-service-<version>.jar
mr-ordenes-service-<version>.jar
mr-logistica-service-<version>.jar
mr-reportes-service-<version>.jar
```

Las APIs evolucionarán de forma compatible por defecto. Un cambio incompatible deberá seguir la estrategia de versionado de contrato establecida en la sección 8 y no podrá romper consumidores de forma silenciosa.

## 24. Construcción de integraciones distribuidas

La integración distribuida se construirá **después de validar los casos de uso locales de los participantes**.

### 24.1 Confirmación de Cotización

Orden de trabajo:

1. Pagos funciona localmente e informa cobertura requerida.
2. Inventario funciona localmente y permite reserva idempotente.
3. Órdenes funciona localmente y permite generación idempotente desde Cotización.
4. Cotizaciones funciona localmente hasta el punto previo a confirmación distribuida.
5. Se implementan adapters reales entre servicios.
6. Se implementa `CotizacionConfirmationOrchestrator`.
7. Se documentan y prueban compensaciones por punto de fallo.
8. Se incorpora persistencia durable de Saga/Outbox o mecanismo equivalente cuando la decisión de infraestructura esté aprobada.
9. Se ejecutan pruebas de fallo parcial, reintento y duplicidad.

### 24.2 Outbox y eventos

La lógica de negocio dependerá de `DomainEventPublisher` y no de Kafka/RabbitMQ u otro proveedor concreto. El adapter físico se incorpora en la etapa de integración.

### 24.3 Identidad servicio-servicio

Los endpoints `/internal/v1/**` no se habilitarán para producción hasta contar con identidad y autorización de servicio aprobadas. La lógica de negocio subyacente sí puede construirse y probarse previamente.

## 25. Definition of Done por caso de uso

Un CU se considera terminado únicamente cuando cumple, según corresponda:

- código compila;
- migración/esquema requerido está validado;
- entidades y repositories corresponden a la BD propietaria;
- Request/Response DTO no exponen entidades JPA;
- reglas están en Service, no en Controller;
- transacción local es atómica;
- permiso se valida en backend;
- concurrencia se controla cuando aplica;
- idempotencia se controla cuando aplica;
- históricos/auditoría se preservan;
- errores siguen el contrato común;
- HATEOAS refleja acciones válidas cuando aplica;
- OpenAPI documenta la operación;
- pruebas unitarias pasan;
- pruebas de integración requeridas pasan;
- criterios de aceptación del CU están cubiertos;
- `./mvnw -pl <servicio> clean verify` termina correctamente.

## 26. Definition of Done por microservicio

Un microservicio se considera construido cuando:

1. todos sus CU no bloqueados cumplen DoD;
2. inicia de forma independiente;
3. usa exclusivamente su BD propietaria;
4. sus migraciones Flyway están versionadas;
5. su OpenAPI es generable y coherente con los endpoints implementados;
6. sus permisos y seguridad están aplicados;
7. sus integraciones externas se encuentran detrás de puertos/adapters;
8. las pruebas locales y de integración pasan;
9. no existen dependencias Maven de dominio hacia otro microservicio;
10. el reactor completo continúa pasando `./mvnw clean verify`.

Los CU bloqueados por decisiones explícitas de la sección 10 se reportarán como bloqueados y no se marcarán artificialmente como terminados.

## 27. Gates de validación del proceso

| Gate | Momento | Validación mínima |
|---|---|---|
| G0 | Foundation | Reactor compila; servicios arrancan de forma independiente. |
| G1 | Cierre de cada CU | DoD del CU + pruebas del módulo. |
| G2 | Cierre de cada microservicio | DoD del servicio + OpenAPI + migraciones. |
| G3 | Integración de dos servicios | Contrato, seguridad, timeouts, fallos y pruebas de integración. |
| G4 | Saga/Outbox | Idempotencia, compensaciones, reintentos y recuperación. |
| G5 | Cierre backend | `clean verify` global, seguridad, performance, observabilidad y trazabilidad CU. |

## 28. Regla de evolución independiente

El monorepo facilita administración y compatibilidad tecnológica, pero no convierte los microservicios en un monolito.

Cada microservicio podrá evolucionar de forma distinta siempre que conserve:

- propiedad exclusiva de sus datos;
- contrato compatible o correctamente versionado;
- artefacto y despliegue propios;
- configuración externalizada;
- migraciones propias;
- ausencia de dependencia directa sobre código de dominio de otros servicios.

Un cambio interno de Repository, algoritmo, índices o modelo de persistencia no obliga a modificar consumidores mientras el contrato del servicio permanezca compatible.

## 29. Entregables por etapa de construcción

| Etapa | Entregable principal |
|---|---|
| Foundation | Reactor Maven, wrapper, módulos, configuración base, seguridad/errores/observabilidad base. |
| Microservicio | Código Spring Boot, migraciones, entidades, repositories, DTO, services, controllers/adapters, OpenAPI y pruebas. |
| CU | Endpoint/evento/job operativo con reglas, seguridad, pruebas y trazabilidad. |
| Integración | Clientes/adapters reales, contratos probados, resiliencia e identidad interna. |
| Saga | Orquestador, compensaciones, idempotencia y recuperación durable aprobada. |
| Hardening | Evidencia de seguridad, performance, observabilidad y validación integral. |

Con esta secuencia, el monorepo conserva una Foundation común y una validación integral única, mientras cada microservicio mantiene evolución, persistencia, pruebas, versionado y despliegue independientes.
