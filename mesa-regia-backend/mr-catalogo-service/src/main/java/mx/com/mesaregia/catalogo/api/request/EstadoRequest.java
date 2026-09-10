package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record EstadoRequest(
        @NotNull Boolean activo,
        @NotNull @PositiveOrZero Long version) {
}
