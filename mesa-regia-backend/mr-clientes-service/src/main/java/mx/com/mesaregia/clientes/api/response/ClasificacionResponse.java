package mx.com.mesaregia.clientes.api.response;

import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import java.time.LocalDateTime;

public record ClasificacionResponse(
    Long id,
    EstadoClienteProspecto estadoAnterior,
    EstadoClienteProspecto estadoNuevo,
    LocalDateTime fechaOperacion,
    String auditReference,
    Long version) {
}
