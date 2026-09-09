package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ServicioCreateRequest(
        @NotBlank @Size(max = 50) String codigo,
        @NotBlank @Size(max = 150) String nombre,
        @Size(max = 500) String descripcion,
        @NotNull @Positive Long idCategoria,
        @NotBlank @Size(max = 60) String tipoServicio,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal tarifaBase,
        @NotNull Boolean activo) {
}
