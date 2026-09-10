package mx.com.mesaregia.ordenes.application.service;

import mx.com.mesaregia.ordenes.api.response.*;
import mx.com.mesaregia.ordenes.domain.enums.*;
import java.time.LocalDate;

public interface OrdenQueryService {
  PageResponse<OrdenListItemResponse> buscar(String texto, Long cotizacion, Long cliente, EstadoOrden estado,
      TipoCompromiso tipo, LocalDate desde, LocalDate hasta, int page, int size);

  OrdenResponse detalle(Long id);
}