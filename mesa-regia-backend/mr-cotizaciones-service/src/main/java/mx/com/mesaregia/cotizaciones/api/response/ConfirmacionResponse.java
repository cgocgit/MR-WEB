package mx.com.mesaregia.cotizaciones.api.response;

import mx.com.mesaregia.cotizaciones.domain.enums.EstadoCotizacion;

public record ConfirmacionResponse(Long idCotizacion, Long idVersion, EstadoCotizacion estado, String referenciaPago,
    String referenciaReserva, Long idOrden, String folioOrden) {
}