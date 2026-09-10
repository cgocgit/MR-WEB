package mx.com.mesaregia.logistica.integration.client;

import mx.com.mesaregia.logistica.domain.enums.HitoOrden;
import mx.com.mesaregia.logistica.integration.dto.OrdenLogisticaContext;

public interface OrdenesLogisticaPort {
  OrdenLogisticaContext obtenerOrden(Long idOrden);

  void aplicarHito(Long idOrden, HitoOrden hito, Long version, Long idUsuario, String motivo);
}
