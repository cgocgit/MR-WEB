package mx.com.mesaregia.inventario.api.response;
import java.util.List;
public record ExistenciaDetalleResponse(ExistenciaResponse existencia, List<ReservaResponse> reservas, List<MovimientoResponse> ultimosMovimientos) {}
