package mx.com.mesaregia.inventario.api.response;

import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import java.time.*;
import java.util.List;

public record ReservaResponse(Long id, String folio, Long idOrdenExterno, EstadoReserva estado, LocalDate fechaInicio,
    LocalDate fechaFin,
    String motivoCancelacion, String referenciaSalida, LocalDateTime creadoEn, LocalDateTime actualizadoEn,
    Long version,
    List<ReservaDetalleResponse> detalles) {
}
