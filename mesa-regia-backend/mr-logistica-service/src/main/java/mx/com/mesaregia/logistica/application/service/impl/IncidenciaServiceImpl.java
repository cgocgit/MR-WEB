package mx.com.mesaregia.logistica.application.service.impl;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.application.service.IncidenciaService;
import mx.com.mesaregia.logistica.domain.entity.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import mx.com.mesaregia.logistica.exception.*;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class IncidenciaServiceImpl implements IncidenciaService {
  private final IncidenciaRepository repo;
  private final SeguimientoIncidenciaRepository seg;
  private final TipoIncidenciaRepository tipos;
  private final ProgramacionLogisticaRepository prog;
  private final AsignacionLogisticaRepository asig;
  private final EtapaLogisticaRepository etapas;
  private final LogisticaMapper map;

  public IncidenciaServiceImpl(IncidenciaRepository r, SeguimientoIncidenciaRepository s, TipoIncidenciaRepository t,
      ProgramacionLogisticaRepository p, AsignacionLogisticaRepository a, EtapaLogisticaRepository e,
      LogisticaMapper m) {
    repo = r;
    seg = s;
    tipos = t;
    prog = p;
    asig = a;
    etapas = e;
    map = m;
  }

  @Transactional(readOnly = true)
  public PageResponse<IncidenciaResponse> buscar(EstadoIncidencia estado, Long idOrden, Long idProgramacion,
      Pageable p) {
    var x = repo.buscar(estado, idOrden, idProgramacion, p)
        .map(i -> map.incidencia(i, seg.findAllByIncidenciaIdOrderByFechaHoraAsc(i.getId())));
    return PageResponse.of(x);
  }

  @Transactional(readOnly = true)
  public IncidenciaResponse obtener(Long id) {
    var i = get(id);
    return map.incidencia(i, seg.findAllByIncidenciaIdOrderByFechaHoraAsc(id));
  }

  @Transactional(readOnly = true)
  public List<TipoIncidenciaResponse> tipos(PerfilReportante p) {
    return tipos.findAllByPerfilReportanteAndActivoTrueOrderByNombreAsc(p).stream().map(map::tipo).toList();
  }

  @Transactional
  public IncidenciaResponse reportar(IncidenciaCreateRequest r) {
    var p = prog.findById(r.idProgramacion())
        .orElseThrow(() -> new ResourceNotFoundException("Programación no encontrada"));
    var a = asig.findByProgramacionIdAndIdOrdenExterno(p.getId(), r.idOrden())
        .filter(x -> x.getEstado() != EstadoAsignacion.CANCELADA)
        .orElseThrow(() -> new BusinessRuleException("La Orden no pertenece a la programación activa"));
    boolean actor = r.perfil() == PerfilReportante.CHOFER ? Objects.equals(r.idUsuario(), p.getIdChoferExterno())
        : Objects.equals(r.idUsuario(), p.getIdRepresentanteExterno());
    if (!actor)
      throw new BusinessRuleException("El usuario no está asignado a esta programación");
    var t = tipos.findById(r.idTipoIncidencia())
        .orElseThrow(() -> new ResourceNotFoundException("Tipo de incidencia no encontrado"));
    if (!t.isActivo() || t.getPerfilReportante() != r.perfil())
      throw new BusinessRuleException("El tipo de incidencia no corresponde al perfil reportante");
    EtapaLogistica e = null;
    if (r.idEtapa() != null) {
      e = etapas.findById(r.idEtapa()).orElseThrow(() -> new ResourceNotFoundException("Fase no encontrada"));
      if (!e.getProgramacion().getId().equals(p.getId()))
        throw new BusinessRuleException("La fase no pertenece a la programación");
    }
    var i = new Incidencia();
    i.setFolio(folio());
    i.setProgramacion(p);
    i.setEtapa(e);
    i.setTipo(t);
    i.setIdOrdenExterno(a.getIdOrdenExterno());
    i.setIdProductoExterno(r.idProducto());
    i.setCantidadAfectada(r.cantidadAfectada());
    i.setEstado(EstadoIncidencia.REPORTADA);
    i.setDescripcion(r.descripcion().trim());
    i.setIdUsuarioReportaExterno(r.idUsuario());
    i = repo.saveAndFlush(i);
    registrar(i, null, EstadoIncidencia.REPORTADA, "Incidencia reportada", r.idUsuario());
    return map.incidencia(i, seg.findAllByIncidenciaIdOrderByFechaHoraAsc(i.getId()));
  }

  @Transactional
  public IncidenciaResponse seguir(Long id, SeguimientoRequest r) {
    var i = get(id);
    ServiceSupport.version(i.getVersion(), r.version());
    if (i.getEstado() == EstadoIncidencia.RESUELTA)
      throw new BusinessRuleException("Una incidencia resuelta no puede reabrirse");
    var anterior = i.getEstado();
    if (i.getEstado() == EstadoIncidencia.REPORTADA)
      i.setEstado(EstadoIncidencia.EN_SEGUIMIENTO);
    i.setIdSupervisorExterno(r.idUsuario());
    i = repo.saveAndFlush(i);
    registrar(i, anterior, i.getEstado(), r.comentario().trim(), r.idUsuario());
    return map.incidencia(i, seg.findAllByIncidenciaIdOrderByFechaHoraAsc(id));
  }

  @Transactional
  public IncidenciaResponse resolver(Long id, ResolverIncidenciaRequest r) {
    var i = get(id);
    ServiceSupport.version(i.getVersion(), r.version());
    if (i.getEstado() != EstadoIncidencia.EN_SEGUIMIENTO)
      throw new BusinessRuleException("La incidencia debe estar EN_SEGUIMIENTO antes de resolverse");
    var ant = i.getEstado();
    i.setEstado(EstadoIncidencia.RESUELTA);
    i.setResolucion(r.resolucion().trim());
    i.setIdSupervisorExterno(r.idSupervisor());
    i.setFechaHoraResolucion(LocalDateTime.now());
    i = repo.saveAndFlush(i);
    registrar(i, ant, EstadoIncidencia.RESUELTA, r.resolucion().trim(), r.idSupervisor());
    return map.incidencia(i, seg.findAllByIncidenciaIdOrderByFechaHoraAsc(id));
  }

  private void registrar(Incidencia i, EstadoIncidencia ant, EstadoIncidencia nuevo, String c, Long u) {
    var s = new SeguimientoIncidencia();
    s.setIncidencia(i);
    s.setEstadoAnterior(ant);
    s.setEstadoNuevo(nuevo);
    s.setComentario(c);
    s.setIdUsuarioExterno(u);
    seg.save(s);
  }

  private String folio() {
    return "INCMR-" + LocalDate.now().getYear() + "-"
        + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
  }

  private Incidencia get(Long id) {
    return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada"));
  }
}
