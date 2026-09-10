package mx.com.mesaregia.ordenes.integration.event;

import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden;
import java.time.LocalDateTime;

public record OrdenEstadoCambiadoEvent(Long idOrden, String folio, EstadoOrden estadoAnterior, EstadoOrden estadoNuevo,
    String accion, LocalDateTime fechaHora, String correlationId) {
}
