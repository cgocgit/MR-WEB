package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;

public record ConfirmacionRequest(@NotNull @Positive Long idUsuario, @NotNull Long version) {
}