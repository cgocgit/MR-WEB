package mx.com.mesaregia.logistica.integration.client;

import mx.com.mesaregia.logistica.integration.dto.InventarioOrdenContext;

public interface InventarioLogisticaPort {
  InventarioOrdenContext consultarEstadoOrden(Long idOrden);
}
