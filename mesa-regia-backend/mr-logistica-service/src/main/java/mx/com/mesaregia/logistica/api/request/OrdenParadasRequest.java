package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrdenParadasRequest(@NotEmpty List<@Valid OrdenParadaItem> paradas,
    @NotNull @PositiveOrZero Long version) {
}
