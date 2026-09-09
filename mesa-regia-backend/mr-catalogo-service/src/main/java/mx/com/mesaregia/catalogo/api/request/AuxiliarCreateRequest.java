package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AuxiliarCreateRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull Boolean activo) {
}
