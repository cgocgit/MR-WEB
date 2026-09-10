package mx.com.mesaregia.inventario.api.response;

import java.time.LocalDate;

public record DisponibilidadResponse(Long idProducto, Long idAlmacen, LocalDate fechaInicio, LocalDate fechaFin,
    Integer existenciaFisica, Integer cantidadReservada, Integer disponible, Integer cantidadSolicitada,
    boolean suficiente) {
}
