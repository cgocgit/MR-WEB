package mx.com.mesaregia.ordenes.api.response; import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden; import java.time.LocalDateTime;
public record HistorialOrdenResponse(Long id,EstadoOrden estadoAnterior,EstadoOrden estadoNuevo,String accion,String motivo,LocalDateTime fechaHora,Long idUsuario) {}
