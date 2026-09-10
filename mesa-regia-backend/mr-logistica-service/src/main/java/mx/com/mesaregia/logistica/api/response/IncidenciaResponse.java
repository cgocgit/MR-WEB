package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.*;
import java.time.LocalDateTime;
import java.util.List;

public record IncidenciaResponse(Long id, String folio, Long idProgramacion, Long idEtapa, Long idTipoIncidencia,
    String tipoCodigo, Long idOrden, Long idProducto, Integer cantidadAfectada, EstadoIncidencia estado,
    String descripcion, Long idUsuarioReporta, Long idSupervisor, String resolucion, LocalDateTime fechaHoraReporte,
    LocalDateTime fechaHoraResolucion, Long version, List<SeguimientoResponse> seguimientos) {
}
