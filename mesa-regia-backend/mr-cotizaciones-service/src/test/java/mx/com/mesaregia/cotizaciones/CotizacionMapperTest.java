package mx.com.mesaregia.cotizaciones;

import mx.com.mesaregia.cotizaciones.domain.entity.CotizacionDetalle;
import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
import mx.com.mesaregia.cotizaciones.mapper.CotizacionMapper;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CotizacionMapperTest {
  @Test
  void calculaSubtotal() {
    var d = new CotizacionDetalle();
    d.setTipoConcepto(TipoConcepto.PRODUCTO);
    d.setCantidad(new BigDecimal("2"));
    d.setPrecioUnitarioAplicado(new BigDecimal("10.00"));
    assertEquals(new BigDecimal("20.00"), CotizacionMapper.detalle(d).subtotal());
  }
}
