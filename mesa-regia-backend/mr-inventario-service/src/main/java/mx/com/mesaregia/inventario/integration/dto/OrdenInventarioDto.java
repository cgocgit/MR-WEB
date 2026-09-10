package mx.com.mesaregia.inventario.integration.dto;

import java.util.Set;

public record OrdenInventarioDto(
    Long idOrden,
    String folio,
    String estado,
    Set<Long> idProductos) {
}
