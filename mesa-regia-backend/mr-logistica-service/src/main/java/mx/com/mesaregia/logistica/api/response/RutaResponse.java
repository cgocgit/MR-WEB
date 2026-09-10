package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion;
import java.time.LocalDateTime;
import java.util.List;

public record RutaResponse(Long idProgramacion, LocalDateTime fechaHoraPreparacion, EstadoProgramacion estado,
    String placa, Long idChofer, Long idRepresentante, List<AsignacionResponse> paradas, List<EtapaResponse> etapas) {
}
