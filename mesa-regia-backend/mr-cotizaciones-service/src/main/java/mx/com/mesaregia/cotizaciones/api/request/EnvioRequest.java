package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;

public record EnvioRequest(@NotBlank @Size(max = 30) String medio, @NotBlank @Size(max = 200) String destinatario,
    @Size(max = 150) String referenciaEnvio, @NotNull @Positive Long idUsuario) {
}