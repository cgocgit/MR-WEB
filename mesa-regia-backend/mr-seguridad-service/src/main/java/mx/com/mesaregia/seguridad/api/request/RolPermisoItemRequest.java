package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.*;

public record RolPermisoItemRequest(@NotNull Long idPermiso, @NotBlank @Size(max = 100) String alcance) {
}
