package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record OrdenParadaItem(@NotNull @Positive Long idAsignacion, @NotNull @Positive Integer ordenParada) {
}
