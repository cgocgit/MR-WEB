package mx.com.mesaregia.clientes.mapper;

import mx.com.mesaregia.clientes.api.response.*;
import mx.com.mesaregia.clientes.domain.entity.ClienteProspecto;
import mx.com.mesaregia.clientes.domain.entity.Contacto;
import mx.com.mesaregia.clientes.domain.enums.Clasificacion;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import mx.com.mesaregia.clientes.domain.enums.EstadoProspecto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClientesMapper {
  public ClienteProspectoResponse cliente(ClienteProspecto e) {
    return new ClienteProspectoResponse(e.getId(), e.getNombres(), e.getApellidos(), estado(e), e.isActivo(),
        e.getVersion(), e.getCreadoEn(), e.getActualizadoEn());
  }

  public ClienteProspectoDetalleResponse detalle(ClienteProspecto e, List<Contacto> contactos) {
    return new ClienteProspectoDetalleResponse(e.getId(), e.getNombres(), e.getApellidos(), estado(e), e.isActivo(),
        e.getVersion(), e.getCreadoEn(), e.getActualizadoEn(), contactos.stream().map(this::contacto).toList());
  }

  public ContactoResponse contacto(Contacto e) {
    return new ContactoResponse(e.getId(), e.getTipoMedioContacto(), e.getMedioContacto(), e.isEsPrincipal(),
        e.isActivo(), e.getVersion(), e.getCreadoEn(), e.getActualizadoEn());
  }

  public EstadoClienteProspecto estado(ClienteProspecto e) {
    if (e.getClasificacion() == Clasificacion.CLIENTE)
      return EstadoClienteProspecto.CLIENTE;
    if (e.getEstadoProspecto() == EstadoProspecto.REVISADO)
      return EstadoClienteProspecto.PROSPECTO_REVISADO;
    return EstadoClienteProspecto.PROSPECTO;
  }
}
