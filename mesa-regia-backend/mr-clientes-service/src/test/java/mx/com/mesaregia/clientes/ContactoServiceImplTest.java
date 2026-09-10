package mx.com.mesaregia.clientes;

import mx.com.mesaregia.clientes.api.request.ContactoCreateRequest;
import mx.com.mesaregia.clientes.application.service.impl.ContactoServiceImpl;
import mx.com.mesaregia.clientes.domain.entity.ClienteProspecto;
import mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto;
import mx.com.mesaregia.clientes.integration.event.DomainEventPublisher;
import mx.com.mesaregia.clientes.mapper.ClientesMapper;
import mx.com.mesaregia.clientes.repository.*;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ContactoServiceImplTest {
  @Test
  void registraContacto() {
    ClienteProspectoRepository clientes = mock(ClienteProspectoRepository.class);
    ContactoRepository contactos = mock(ContactoRepository.class);
    DomainEventPublisher events = mock(DomainEventPublisher.class);
    var service = new ContactoServiceImpl(clientes, contactos, new ClientesMapper(), events);
    ClienteProspecto c = new ClienteProspecto();
    c.setId(1L);
    when(clientes.findById(1L)).thenReturn(Optional.of(c));
    when(contactos.saveAndFlush(any())).thenAnswer(inv -> {
      var e = inv.getArgument(0, mx.com.mesaregia.clientes.domain.entity.Contacto.class);
      e.setId(10L);
      return e;
    });
    var out = service.registrar(1L, new ContactoCreateRequest(TipoMedioContacto.CORREO, "x@y.com", true));
    assertEquals(10L, out.id());
  }
}
