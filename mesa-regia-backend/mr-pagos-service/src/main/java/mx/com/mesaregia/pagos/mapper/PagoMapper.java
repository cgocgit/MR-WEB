package mx.com.mesaregia.pagos.mapper;

import mx.com.mesaregia.pagos.api.response.MovimientoPagoResponse;
import mx.com.mesaregia.pagos.domain.entity.*;
import org.springframework.stereotype.Component;

@Component
public class PagoMapper {
  public MovimientoPagoResponse movimiento(MovimientoCuenta m) {
    var c = m.getCuentaCobro();
    var p = m.getPago();
    var o = m.getMovimientoOrigen();
    var op = o == null ? null : o.getPago();
    return new MovimientoPagoResponse(m.getId(), m.getFolio(), m.getTipoMovimiento(), m.getNaturaleza(), m.getMonto(),
        m.getFechaHora(), c.getId(), c.getIdCotizacionExterno(), c.getIdCotizacionVersionExterno(),
        c.getFolioCotizacionSnapshot(), c.getNumeroVersionSnapshot(), c.getNombreClienteSnapshot(), c.getEstado(),
        p == null ? null : p.getId(), p == null ? null : p.getFolio(), p == null ? null : p.getFechaPago(),
        p == null ? null : p.getMetodoPago(), p == null ? null : p.getReferenciaPago(),
        p == null ? null : p.getObservaciones(), m.getIdUsuarioExterno(), op == null ? null : op.getId(),
        op == null ? null : op.getFolio(), m.getDescripcion());
  }
}
