package mx.com.mesaregia.inventario.api.response;

public record ReservaDetalleResponse(Long id, Long idExistencia, Long idProducto, Long idAlmacen,
    Integer cantidadReservada,
    Integer cantidadSalidaAcumulada, Integer cantidadRetornadaAcumulada) {
}
