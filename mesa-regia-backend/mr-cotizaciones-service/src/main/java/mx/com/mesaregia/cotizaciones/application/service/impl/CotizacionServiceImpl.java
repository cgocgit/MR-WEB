package mx.com.mesaregia.cotizaciones.application.service.impl;

import mx.com.mesaregia.cotizaciones.api.request.*;
import mx.com.mesaregia.cotizaciones.api.response.CotizacionResponse;
import mx.com.mesaregia.cotizaciones.application.service.CotizacionService;
import mx.com.mesaregia.cotizaciones.domain.entity.*;
import mx.com.mesaregia.cotizaciones.domain.enums.*;
import mx.com.mesaregia.cotizaciones.exception.*;
import mx.com.mesaregia.cotizaciones.integration.client.*;
import mx.com.mesaregia.cotizaciones.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class CotizacionServiceImpl implements CotizacionService {
  private final CotizacionRepository c;
  private final CotizacionVersionRepository v;
  private final DomicilioRepository dom;
  private final EventoRepository ev;
  private final CotizacionSupport s;
  private final ClienteProspectoPort clientes;
  private final CatalogoPricingPort catalogo;

  public CotizacionServiceImpl(CotizacionRepository c, CotizacionVersionRepository v, DomicilioRepository dom,
      EventoRepository ev, CotizacionSupport s, ClienteProspectoPort clientes, CatalogoPricingPort catalogo) {
    this.c = c;
    this.v = v;
    this.dom = dom;
    this.ev = ev;
    this.s = s;
    this.clientes = clientes;
    this.catalogo = catalogo;
  }

  @Transactional
  public CotizacionResponse crear(CotizacionCreateRequest r) {
    clientes.validarExistencia(r.idClienteProspecto());
    catalogo.validarListaPrecio(r.idListaPrecio());
    int ejercicio = Year.now().getValue();
    long consecutivo = Optional.ofNullable(c.maxConsecutivo(ejercicio)).orElse(0L) + 1;
    var q = new Cotizacion();
    q.setEjercicio(ejercicio);
    q.setConsecutivo(consecutivo);
    q.setFolio("COTMR-" + String.valueOf(ejercicio).substring(2) + "-" + String.format("%06d", consecutivo));
    q.setIdClienteProspectoExterno(r.idClienteProspecto());
    q.setPorcentajeConfirmacion(r.porcentajeConfirmacion());
    q.setIdUsuarioCreacionExterno(r.idUsuario());
    q = c.saveAndFlush(q);
    var d = new Domicilio();
    d.setIdCotizacion(q.getId());
    d.setDireccion(r.direccion());
    d.setReferencias(r.referencias());
    dom.save(d);
    var e = new Evento();
    e.setIdCotizacion(q.getId());
    e.setDescripcion(r.evento());
    e.setFechaEvento(r.fechaEvento());
    e.setHoraEvento(r.horaEvento());
    ev.save(e);
    var ver = new CotizacionVersion();
    ver.setIdCotizacion(q.getId());
    ver.setNumeroVersion(1);
    ver.setFolioVersion(q.getFolio() + "-V1");
    ver.setIdListaPrecioExterno(r.idListaPrecio());
    ver.setIdUsuarioCreacionExterno(r.idUsuario());
    ver = v.save(ver);
    s.history(q.getId(), ver.getId(), "COTIZACION_CREADA", null, EstadoCotizacion.BORRADOR.name(), null, r.idUsuario());
    return s.response(q);
  }

  @Transactional
  public CotizacionResponse seguimiento(Long id, SeguimientoRequest r) {
    var q = s.get(id);
    if (terminal(q.getEstadoGeneral()))
      throw new ConflictException("La cotización está en estado terminal");
    s.history(id, r.idVersion(), "SEGUIMIENTO", q.getEstadoGeneral().name(), q.getEstadoGeneral().name(),
        r.descripcion(), r.idUsuario());
    return s.response(q);
  }

  @Transactional
  public CotizacionResponse seleccionarVersion(Long id, SeleccionVersionRequest r) {
    var q = s.get(id);
    if (!Objects.equals(q.getVersion(), r.version()))
      throw new ConflictException("Versión de concurrencia desactualizada");
    if (q.getEstadoGeneral() == EstadoCotizacion.CANCELADA || q.getEstadoGeneral() == EstadoCotizacion.RECHAZADA
        || q.getEstadoGeneral() == EstadoCotizacion.VENCIDA)
      throw new ConflictException("No se puede seleccionar versión en estado terminal");
    var ver = s.version(id, r.idVersion());
    if (ver.getEstadoVersion() != EstadoVersion.ENVIADA)
      throw new BusinessRuleException("La versión elegida debe haber sido enviada");
    q.setIdVersionElegida(ver.getId());
    q.setIdUsuarioModificacionExterno(r.idUsuario());
    q = c.saveAndFlush(q);
    s.history(id, ver.getId(), "VERSION_ELEGIDA", null, null, "Versión V" + ver.getNumeroVersion() + " seleccionada",
        r.idUsuario());
    return s.response(q);
  }

  @Transactional
  public CotizacionResponse cancelar(Long id, EstadoTerminalRequest r) {
    return terminal(id, r, EstadoCotizacion.CANCELADA, "COTIZACION_CANCELADA");
  }

  @Transactional
  public CotizacionResponse rechazar(Long id, EstadoTerminalRequest r) {
    return terminal(id, r, EstadoCotizacion.RECHAZADA, "COTIZACION_RECHAZADA");
  }

  private CotizacionResponse terminal(Long id, EstadoTerminalRequest r, EstadoCotizacion nuevo, String evento) {
    var q = s.get(id);
    if (!Objects.equals(q.getVersion(), r.version()))
      throw new ConflictException("Versión de concurrencia desactualizada");
    if (terminal(q.getEstadoGeneral()))
      throw new ConflictException("La cotización ya está en estado terminal");
    var ant = q.getEstadoGeneral();
    q.setEstadoGeneral(nuevo);
    q.setIdUsuarioModificacionExterno(r.idUsuario());
    q = c.saveAndFlush(q);
    s.history(id, null, evento, ant.name(), nuevo.name(), r.motivo(), r.idUsuario());
    return s.response(q);
  }

  @Transactional
  public int vencerElegibles() {
    int count = 0;
    var now = LocalDateTime.now();
    for (var q : c.findAll()) {
      if (q.getEstadoGeneral() == EstadoCotizacion.CONFIRMADA || terminal(q.getEstadoGeneral()))
        continue;
      var e = ev.findByIdCotizacion(q.getId()).orElse(null);
      if (e != null && !LocalDateTime.of(e.getFechaEvento(), e.getHoraEvento()).isAfter(now)) {
        var ant = q.getEstadoGeneral();
        q.setEstadoGeneral(EstadoCotizacion.VENCIDA);
        c.save(q);
        s.history(q.getId(), null, "COTIZACION_VENCIDA", ant.name(), EstadoCotizacion.VENCIDA.name(),
            "Vigencia concluida", null);
        count++;
      }
    }
    return count;
  }

  private boolean terminal(EstadoCotizacion e) {
    return e == EstadoCotizacion.CANCELADA || e == EstadoCotizacion.RECHAZADA || e == EstadoCotizacion.VENCIDA;
  }
}
