package mx.com.mesaregia.pagos.api.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CompensacionCreateRequest(
    @NotNull @DecimalMin(value = "0.01") @Digits(integer = 12, fraction = 2) BigDecimal monto,
    @NotBlank @Size(max = 1000) String motivo, @NotNull @Positive Long idUsuarioExterno) {
}
