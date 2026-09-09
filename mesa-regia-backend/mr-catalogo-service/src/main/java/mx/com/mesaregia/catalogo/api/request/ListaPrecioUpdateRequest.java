package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ListaPrecioUpdateRequest(
        @NotBlank @Size(max = 40) String codigo,
        @NotBlank @Size(max = 150) String nombre,
        @Size(max = 500) String descripcion,
        @NotNull LocalDate vigenciaInicio,
        @NotNull LocalDate vigenciaFin,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") @Digits(integer = 3, fraction = 2) BigDecimal porcentajeAdicionalFueraLista,
        @NotNull @PositiveOrZero Long version) {
}
