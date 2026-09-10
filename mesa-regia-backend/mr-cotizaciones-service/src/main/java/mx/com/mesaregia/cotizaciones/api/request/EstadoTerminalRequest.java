package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;

public record EstadoTerminalRequest(@NotBlank @Size(max = 500) String motivo, @NotNull @Positive Long idUsuario,
    @NotNull Long version) {
}