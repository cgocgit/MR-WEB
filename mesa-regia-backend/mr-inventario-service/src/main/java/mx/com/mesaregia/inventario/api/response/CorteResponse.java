package mx.com.mesaregia.inventario.api.response;
import mx.com.mesaregia.inventario.domain.enums.EstadoCorte; import java.time.LocalDateTime; import java.util.List;
public record CorteResponse(Long id, String folio, Long idAlmacen, EstadoCorte estado, LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraCierre,
 Long idUsuarioInicioExterno, Long idUsuarioCierreExterno, String observaciones, Long version, List<CorteDetalleResponse> detalles) {}
