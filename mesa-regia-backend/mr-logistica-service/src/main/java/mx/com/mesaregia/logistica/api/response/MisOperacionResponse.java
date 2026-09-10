package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.*;
import java.time.LocalDateTime;

public record MisOperacionResponse(Long idAsignacion, Long idProgramacion, Long idOrden, Integer ordenParada,
    LocalDateTime fechaHoraPreparacion, LocalDateTime fechaHoraProgramada, String placa,
    EstadoProgramacion estadoProgramacion, EstadoAsignacion estadoAsignacion) {
}
