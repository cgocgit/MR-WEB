package mx.com.mesaregia.catalogo.api.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ListaPrecioResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        LocalDate vigenciaInicio,
        LocalDate vigenciaFin,
        BigDecimal porcentajeAdicionalFueraLista,
        boolean activo,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        Long version) {
}
