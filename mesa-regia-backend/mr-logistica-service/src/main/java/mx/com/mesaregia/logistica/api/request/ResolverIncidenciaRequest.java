package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record ResolverIncidenciaRequest(@NotBlank @Size(max = 1000) String resolucion,
    @NotNull @Positive Long idSupervisor, @NotNull @PositiveOrZero Long version) {
}
