package mx.com.mesaregia.inventario;

import mx.com.mesaregia.inventario.application.service.impl.*;
import mx.com.mesaregia.inventario.domain.entity.*;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DisponibilidadServiceImplTest {
  @Test
  void calculaDisponibleSinNegativos() {
    var support = mock(InventorySupport.class);
    var e = new Existencia();
    e.setId(1L);
    e.setIdProductoExterno(10L);
    e.setExistenciaFisica(5);
    when(support.existencia(1L, 10L)).thenReturn(e);
    when(support.reservada(eq(1L), any(), any())).thenReturn(8);
    var s = new DisponibilidadServiceImpl(support);
    var r = s.consultarFutura(10L, 1L, LocalDate.now(), LocalDate.now(), 1);
    assertEquals(0, r.disponible());
    assertFalse(r.suficiente());
  }
}
