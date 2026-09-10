package mx.com.mesaregia.logistica.api.response;

import java.time.LocalDate;

public record InternalLogisticaOrdenContextResponse(Long idOrden, LocalDate fechaInicio, LocalDate fechaFin,
    String estado) {
}
