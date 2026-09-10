package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record VehiculoEstadoRequest(boolean activo, @NotNull @PositiveOrZero Long version) {
}
