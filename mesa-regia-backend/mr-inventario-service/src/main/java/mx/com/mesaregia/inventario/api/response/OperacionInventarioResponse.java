package mx.com.mesaregia.inventario.api.response;
import java.util.List;
public record OperacionInventarioResponse(Long idOrdenExterno, String estadoReserva, Integer cantidadPendiente, List<MovimientoResponse> movimientos) {}
