package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion;
import java.time.LocalDateTime;
import java.util.List;

public record ProgramacionResponse(Long id, LocalDateTime fechaHoraPreparacion, Long idSupervisor, Long idRepresentante,
    Long idChofer, VehiculoResponse vehiculo, EstadoProgramacion estado, String motivoReprogramacion, Long version,
    List<AsignacionResponse> asignaciones, List<EtapaResponse> etapas) {
}
