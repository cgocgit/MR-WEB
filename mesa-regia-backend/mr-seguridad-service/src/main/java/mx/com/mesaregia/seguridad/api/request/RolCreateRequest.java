package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.*;

public record RolCreateRequest(@NotBlank @Size(max = 40) String codigo, @NotBlank @Size(max = 100) String nombre,
    @Size(max = 250) String descripcion, boolean activo) {
}
