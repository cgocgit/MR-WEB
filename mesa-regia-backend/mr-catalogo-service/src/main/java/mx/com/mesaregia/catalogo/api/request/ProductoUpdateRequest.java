package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductoUpdateRequest(
        @NotBlank @Size(max = 50) String codigo,
        @NotBlank @Size(max = 150) String nombre,
        @Size(max = 500) String descripcion,
        @NotNull @Positive Long idCategoria,
        @NotNull @Positive Long idTipoProducto,
        @Positive Long idColor,
        @NotBlank @Size(max = 40) String unidadMedida,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal precioBase,
        @NotNull @PositiveOrZero Long version) {
}
