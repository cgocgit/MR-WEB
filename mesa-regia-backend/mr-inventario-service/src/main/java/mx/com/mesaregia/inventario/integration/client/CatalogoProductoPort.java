package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.ProductoInventarioDto;
import java.util.Optional;

/** Puerto preparado para enriquecer/validar productos sin acceso cross-DB. */
public interface CatalogoProductoPort {
    Optional<ProductoInventarioDto> obtenerProducto(Long idProducto);
}
