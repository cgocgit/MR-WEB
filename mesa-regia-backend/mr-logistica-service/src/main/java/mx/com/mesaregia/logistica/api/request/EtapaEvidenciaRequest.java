package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record EtapaEvidenciaRequest(@NotBlank @Size(max = 500) String evidencia1,
    @NotBlank @Size(max = 500) String evidencia2, @NotBlank @Size(max = 500) String evidencia3,
    @NotBlank @Size(max = 1000) String comentario, @NotNull @Positive Long idUsuario,
    @NotNull @PositiveOrZero Long version) {
}
