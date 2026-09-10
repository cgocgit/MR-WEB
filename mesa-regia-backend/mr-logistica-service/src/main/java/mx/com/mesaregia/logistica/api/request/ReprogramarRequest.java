package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record ReprogramarRequest(@NotNull LocalDateTime fechaHoraPreparacion, @NotBlank @Size(max = 500) String motivo,
    @NotNull @PositiveOrZero Long version) {
}
