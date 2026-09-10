package mx.com.mesaregia.pagos.application.service;

import mx.com.mesaregia.pagos.api.response.*;
import mx.com.mesaregia.pagos.domain.enums.*;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;

public interface PagoQueryService {
  PageResponse<MovimientoPagoResponse> buscar(String folio, Integer version, String cliente, LocalDate desde,
      LocalDate hasta, MetodoPago metodo, TipoRegistroPago tipo, EstadoCuentaCobro estado, Long idUsuario,
      Pageable pageable);
}
