package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.*;

public record InternalAuditEventRequest(
    @NotBlank @Size(max = 80) String modulo,
    @NotBlank @Size(max = 100) String accion,
    @Size(max = 100) String tipoRecurso,
    @Size(max = 150) String identificadorRecurso,
    @Size(max = 500) String motivo,
    String detalle,
    @Size(max = 100) String correlationId) {
}
