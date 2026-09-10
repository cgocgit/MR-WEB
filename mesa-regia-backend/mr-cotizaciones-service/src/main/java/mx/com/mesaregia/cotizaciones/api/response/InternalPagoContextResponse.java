package mx.com.mesaregia.cotizaciones.api.response;

import java.math.BigDecimal;

public record InternalPagoContextResponse(Long idCotizacion, Long idCotizacionVersion, Long idCliente,
    String folioCotizacion, Integer numeroVersion, String nombreCliente, BigDecimal importeTotal,
    BigDecimal porcentajeConfirmacion, boolean versionElegida) {
}
