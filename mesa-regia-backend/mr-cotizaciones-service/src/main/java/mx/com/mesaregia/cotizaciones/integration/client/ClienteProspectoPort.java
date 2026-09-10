package mx.com.mesaregia.cotizaciones.integration.client;

import mx.com.mesaregia.cotizaciones.integration.dto.ClienteContext;

public interface ClienteProspectoPort {
  ClienteContext obtener(Long idClienteProspecto);

  default void validarExistencia(Long id) {
    obtener(id);
  }
}
