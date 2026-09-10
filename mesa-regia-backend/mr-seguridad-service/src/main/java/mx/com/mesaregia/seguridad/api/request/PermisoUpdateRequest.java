package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.*;

public record PermisoUpdateRequest(@NotBlank @Size(max = 80) String modulo, @NotBlank @Size(max = 100) String accion,
    @Size(max = 250) String descripcion, @NotNull Long version) {
}
