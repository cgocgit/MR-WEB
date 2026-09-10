package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.NotNull;

public record EstadoRequest(@NotNull Boolean activo, @NotNull Long version) {
}
