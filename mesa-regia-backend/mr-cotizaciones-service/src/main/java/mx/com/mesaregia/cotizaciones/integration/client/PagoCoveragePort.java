package mx.com.mesaregia.cotizaciones.integration.client;

import mx.com.mesaregia.cotizaciones.integration.dto.CoberturaPago;

public interface PagoCoveragePort {
  CoberturaPago consultar(Long idCotizacion, Long idVersion);
}