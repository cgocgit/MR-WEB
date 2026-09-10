package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import mx.com.mesaregia.catalogo.domain.enums.TipoComponente;

import java.math.BigDecimal;

public record PaqueteComponenteRequest(
        @NotNull TipoComponente tipo,
        @NotNull @Positive Long idConcepto,
        @NotNull @DecimalMin(value = "0.001") @Digits(integer = 9, fraction = 3) BigDecimal cantidad,
        @PositiveOrZero Integer orden) {
}
