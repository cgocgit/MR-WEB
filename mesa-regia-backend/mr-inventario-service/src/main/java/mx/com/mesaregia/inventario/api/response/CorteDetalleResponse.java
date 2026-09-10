package mx.com.mesaregia.inventario.api.response;

public record CorteDetalleResponse(Long id, Long idExistencia, Long idProducto, Integer cantidadRegistrada,
    Integer cantidadFisica, Integer diferencia) {
}
