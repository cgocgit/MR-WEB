package mx.com.mesaregia.pagos.api.response;

import mx.com.mesaregia.pagos.domain.enums.*;
import java.math.BigDecimal;
import java.time.*;

public record MovimientoPagoResponse(Long idMovimiento, String folioMovimiento, TipoMovimientoCuenta tipo,
    NaturalezaMovimiento naturaleza, BigDecimal monto, LocalDateTime fechaHora, Long idCuentaCobro, Long idCotizacion,
    Long idCotizacionVersion, String folioCotizacion, Integer numeroVersion, String cliente,
    EstadoCuentaCobro estadoCuenta, Long idPago, String folioPago, LocalDate fechaPago, MetodoPago metodoPago,
    String referenciaPago, String observaciones, Long idUsuarioExterno, Long idPagoOriginal, String folioPagoOriginal,
    String descripcion) {
}
