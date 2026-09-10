package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;

public record CategoriaUpdateRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull AmbitoCategoria ambito,
        @NotNull @PositiveOrZero Long version) {
}
