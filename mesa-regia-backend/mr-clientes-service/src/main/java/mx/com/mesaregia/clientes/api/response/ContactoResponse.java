package mx.com.mesaregia.clientes.api.response;

import mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto;
import java.time.LocalDateTime;

public record ContactoResponse(
    Long id,
    TipoMedioContacto tipoMedioContacto,
    String medioContacto,
    boolean esPrincipal,
    boolean activo,
    Long version,
    LocalDateTime creadoEn,
    LocalDateTime actualizadoEn) {
}
