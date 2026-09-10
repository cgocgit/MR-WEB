package mx.com.mesaregia.ordenes.api.request;

import jakarta.validation.constraints.*;

public record LiberacionRequest(@NotNull @Positive Long version, @NotNull @Positive Long idUsuario,
    @Size(max = 500) String comentario) {
}
