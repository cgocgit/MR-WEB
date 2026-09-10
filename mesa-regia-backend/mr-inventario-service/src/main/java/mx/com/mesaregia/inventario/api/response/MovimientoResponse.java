package mx.com.mesaregia.inventario.api.response;
import mx.com.mesaregia.inventario.domain.enums.*; import java.time.LocalDateTime;
public record MovimientoResponse(Long id, String folio, Long idExistencia, Long idProducto, Long idAlmacen, TipoMovimiento tipoMovimiento,
 OrigenOperacion origenOperacion, Integer cantidad, Integer existenciaAnterior, Integer existenciaResultante,
 Long idOrdenExterno, Long idCorteFisico, String motivo, String comentario, Long idUsuarioExterno, LocalDateTime fechaHora) {}
