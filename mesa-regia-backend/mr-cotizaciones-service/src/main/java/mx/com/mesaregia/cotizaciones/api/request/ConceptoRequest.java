package mx.com.mesaregia.cotizaciones.api.request;

import jakarta.validation.constraints.*;
import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
import java.math.BigDecimal;

public record ConceptoRequest(@NotNull TipoConcepto tipoConcepto, @NotNull @Positive Long idConcepto,
    @NotNull @DecimalMin(value = "0.001") BigDecimal cantidad) {
}