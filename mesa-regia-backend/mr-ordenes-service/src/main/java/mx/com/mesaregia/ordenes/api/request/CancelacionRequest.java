package mx.com.mesaregia.ordenes.api.request;

import jakarta.validation.constraints.*;

public record CancelacionRequest(@NotNull @Positive Long version, @NotNull @Positive Long idUsuario,
    @NotBlank @Size(max = 500) String motivo) {
}
