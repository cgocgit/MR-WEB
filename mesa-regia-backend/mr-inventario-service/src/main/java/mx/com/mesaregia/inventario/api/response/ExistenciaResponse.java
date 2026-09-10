package mx.com.mesaregia.inventario.api.response;

import java.time.LocalDateTime;

public record ExistenciaResponse(Long idExistencia, Long idAlmacen, String almacen, Long idProducto,
    Integer existenciaFisica,
    Integer cantidadReservada, Integer disponible, Integer minimo, Integer maximo, String nivel,
    LocalDateTime actualizadoEn, Long version) {
}
