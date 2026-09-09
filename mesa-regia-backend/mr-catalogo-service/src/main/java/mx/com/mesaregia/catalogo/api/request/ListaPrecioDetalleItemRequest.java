package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import mx.com.mesaregia.catalogo.domain.enums.TipoConceptoPrecio;

import java.math.BigDecimal;

public record ListaPrecioDetalleItemRequest(
        @NotNull TipoConceptoPrecio tipo,
        @NotNull @Positive Long idConcepto,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal precio,
        @NotNull Boolean activo) {
}
