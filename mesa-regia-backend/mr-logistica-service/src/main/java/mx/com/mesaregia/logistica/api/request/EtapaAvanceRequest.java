package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record EtapaAvanceRequest(@PositiveOrZero Integer cantidadAtendida, @Size(max = 1000) String comentario,
    @NotNull @Positive Long idUsuario, @NotNull @PositiveOrZero Long version) {
}
