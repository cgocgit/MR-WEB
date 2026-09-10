package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;

public record RecotizarRequest(@Positive Long idVersionOrigen, @NotNull @Positive Long idListaPrecio,
    @Positive Long idUsuario) {
}