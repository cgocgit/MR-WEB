package mx.com.mesaregia.seguridad.api.response;

import java.time.LocalDateTime;

public record AuditoriaResponse(Long id, LocalDateTime fechaHora, Long idUsuario, String usuarioIdentificador,
    String modulo, String accion, String tipoRecurso, String identificadorRecurso, String resultado, String motivo,
    String valorAnterior, String valorNuevo, String detalle, String idCorrelacion) {
}
