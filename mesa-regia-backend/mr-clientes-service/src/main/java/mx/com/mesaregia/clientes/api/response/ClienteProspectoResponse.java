package mx.com.mesaregia.clientes.api.response;

import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import java.time.LocalDateTime;

public record ClienteProspectoResponse(
    Long id,
    String nombres,
    String apellidos,
    EstadoClienteProspecto estado,
    boolean activo,
    Long version,
    LocalDateTime creadoEn,
    LocalDateTime actualizadoEn) {
}
