package mx.com.mesaregia.clientes;

import mx.com.mesaregia.clientes.api.request.ClasificacionRequest;
import mx.com.mesaregia.clientes.application.service.impl.ClienteProspectoServiceImpl;
import mx.com.mesaregia.clientes.domain.entity.ClienteProspecto;
import mx.com.mesaregia.clientes.domain.enums.*;
import mx.com.mesaregia.clientes.integration.event.DomainEventPublisher;
import mx.com.mesaregia.clientes.mapper.ClientesMapper;
import mx.com.mesaregia.clientes.repository.*;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClienteProspectoServiceImplTest {
  @Test
  void clasificaProspectoPendienteComoCliente() {
    ClienteProspectoRepository cr = mock(ClienteProspectoRepository.class);
    ContactoRepository cor = mock(ContactoRepository.class);
    DomainEventPublisher events = mock(DomainEventPublisher.class);
    ClientesMapper mapper = new ClientesMapper();
    var service = new ClienteProspectoServiceImpl(cr, cor, mapper, events);

    ClienteProspecto e = new ClienteProspecto();
    e.setId(1L);
    e.setClasificacion(Clasificacion.PROSPECTO);
    e.setEstadoProspecto(EstadoProspecto.PENDIENTE);
    e.setVersion(2L);
    when(cr.findById(1L)).thenReturn(Optional.of(e));

    var out = service.clasificar(1L, new ClasificacionRequest(EstadoClienteProspecto.CLIENTE, 2L));
    assertEquals(EstadoClienteProspecto.CLIENTE, out.estadoNuevo());
    assertEquals(Clasificacion.CLIENTE, e.getClasificacion());
    assertNull(e.getEstadoProspecto());
    verify(cr).flush();
  }
}
