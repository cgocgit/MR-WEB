package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;

public record CategoriaCreateRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull AmbitoCategoria ambito,
        @NotNull Boolean activo) {
}
