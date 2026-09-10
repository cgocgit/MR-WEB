package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record AsignacionCreateRequest(@NotNull @Positive Long idOrden, @NotNull @Positive Integer ordenParada,
    LocalDateTime fechaHoraProgramada, @NotNull @PositiveOrZero Long version) {
}
