package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;

public record SeguimientoRequest(@NotBlank @Size(max = 500) String descripcion, @Positive Long idVersion,
    @NotNull @Positive Long idUsuario) {
}