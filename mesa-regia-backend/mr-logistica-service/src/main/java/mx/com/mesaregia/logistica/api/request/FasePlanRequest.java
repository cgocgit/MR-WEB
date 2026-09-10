package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;
import mx.com.mesaregia.logistica.domain.enums.CodigoEtapa;

public record FasePlanRequest(@NotNull CodigoEtapa codigoEtapa, @Positive Integer duracionPrevistaMinutos,
    @Positive Integer cantidadPrevista) {
}
