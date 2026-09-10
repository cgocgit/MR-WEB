package mx.com.mesaregia.ordenes.api.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import mx.com.mesaregia.ordenes.domain.enums.TipoConcepto;

import java.math.BigDecimal;

public record OrdenDetalleCreateRequest(
    @Size(max = 50) String claveTemporal,
    @Size(max = 50) String clavePadreTemporal,
    @NotNull TipoConcepto tipoConcepto,
    @NotNull @Positive Long idConceptoExterno,
    @Size(max = 50) String codigoSnapshot,
    @NotBlank @Size(max = 200) String nombreSnapshot,
    @NotNull @DecimalMin(value = "0.001") BigDecimal cantidad,
    @Positive Integer orden) {
}
