package mx.com.mesaregia.cotizaciones.application.service; import mx.com.mesaregia.cotizaciones.api.response.InternalPagoContextResponse;
public interface CotizacionIntegrationQueryService { InternalPagoContextResponse pagoContexto(Long idCotizacion,Long idVersion); }
