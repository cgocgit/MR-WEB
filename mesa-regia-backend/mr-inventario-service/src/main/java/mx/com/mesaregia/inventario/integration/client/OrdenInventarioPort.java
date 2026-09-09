package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.OrdenInventarioDto;
import java.util.Optional;

/** Puerto de consulta al propietario de Órdenes; adapter REST se incorpora en Etapa 10. */
public interface OrdenInventarioPort {
    Optional<OrdenInventarioDto> obtenerOrden(Long idOrden);
}
