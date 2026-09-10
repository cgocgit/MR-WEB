package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.LogisticaInventarioDto;
import java.util.Optional;

/**
 * Puerto de contexto logístico; Inventario nunca accede a mr_logistica
 * directamente.
 */
public interface LogisticaInventarioPort {
  Optional<LogisticaInventarioDto> obtenerContexto(Long idOrden);
}
