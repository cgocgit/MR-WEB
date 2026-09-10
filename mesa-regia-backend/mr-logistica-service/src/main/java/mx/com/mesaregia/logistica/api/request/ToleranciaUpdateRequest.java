package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record ToleranciaUpdateRequest(@NotNull @Positive Integer minutos, @NotNull @PositiveOrZero Long version) {
}
