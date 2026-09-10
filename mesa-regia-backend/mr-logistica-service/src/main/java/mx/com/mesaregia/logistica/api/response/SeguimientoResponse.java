package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.EstadoIncidencia;
import java.time.LocalDateTime;

public record SeguimientoResponse(Long id, EstadoIncidencia estadoAnterior, EstadoIncidencia estadoNuevo,
    String comentario, Long idUsuario, LocalDateTime fechaHora) {
}
