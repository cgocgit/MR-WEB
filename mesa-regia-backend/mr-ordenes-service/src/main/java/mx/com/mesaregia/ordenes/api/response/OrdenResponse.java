package mx.com.mesaregia.ordenes.api.response;

import mx.com.mesaregia.ordenes.domain.enums.*;
import java.time.*;
import java.util.*;

public record OrdenResponse(Long id, String folio, EstadoOrden estado, TipoCompromiso tipoCompromiso, Long idCotizacion,
    Long idCotizacionVersion, Long idCliente, String cliente, String contacto, String evento,
    LocalDateTime fechaHoraEvento, String domicilio, String observaciones, String referenciaPago,
    String referenciaReserva, LocalDateTime fechaGeneracion, LocalDateTime actualizadoEn, Long version,
    List<OrdenDetalleResponse> detalles, List<HistorialOrdenResponse> historial) {
}
