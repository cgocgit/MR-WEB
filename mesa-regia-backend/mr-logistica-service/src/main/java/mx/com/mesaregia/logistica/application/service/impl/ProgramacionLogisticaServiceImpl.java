package mx.com.mesaregia.logistica.application.service.impl;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.ProgramacionResponse;
import mx.com.mesaregia.logistica.application.service.ProgramacionLogisticaService;
import mx.com.mesaregia.logistica.domain.entity.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import mx.com.mesaregia.logistica.exception.*;
import mx.com.mesaregia.logistica.integration.client.OrdenesLogisticaPort;
import mx.com.mesaregia.logistica.integration.dto.OrdenLogisticaContext;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProgramacionLogisticaServiceImpl implements ProgramacionLogisticaService {
  private final ProgramacionLogisticaRepository repo;
  private final AsignacionLogisticaRepository asig;
  private final EtapaLogisticaRepository etapaRepo;
  private final ToleranciaRepository tolRepo;
  private final VehiculoRepository vehRepo;
  private final OrdenesLogisticaPort ordenes;
  private final LogisticaMapper map;

  public ProgramacionLogisticaServiceImpl(ProgramacionLogisticaRepository r, AsignacionLogisticaRepository a,
      EtapaLogisticaRepository e, ToleranciaRepository t, VehiculoRepository v, OrdenesLogisticaPort o,
      LogisticaMapper m) {
    repo = r;
    asig = a;
    etapaRepo = e;
    tolRepo = t;
    vehRepo = v;
    ordenes = o;
    map = m;
  }

  @Transactional
  public ProgramacionResponse programar(ProgramacionCreateRequest r) {
    OrdenLogisticaContext oc = ordenes.obtenerOrden(r.idOrden());
    if (!"PENDIENTE_PROGRAMACION".equals(oc.estado()))
      throw new BusinessRuleException("La Orden debe estar PENDIENTE_PROGRAMACION");
    var p = new ProgramacionLogistica();
    p.setFechaHoraPreparacion(r.fechaHoraPreparacion());
    p.setIdSupervisorExterno(r.idSupervisor());
    p.setEstado(EstadoProgramacion.PROGRAMADA);
    p = repo.saveAndFlush(p);
    var a = new AsignacionLogistica();
    a.setProgramacion(p);
    a.setIdOrdenExterno(r.idOrden());
    a.setOrdenParada(1);
    a.setFechaHoraProgramada(oc.fechaHoraEvento());
    a.setDomicilioSnapshot(oc.domicilioSnapshot());
    a.setEstado(EstadoAsignacion.PENDIENTE);
    asig.save(a);
    crearEtapas(p, oc, r.fases());
    repo.flush();
    return full(p);
  }

  @Transactional
  public ProgramacionResponse reprogramar(Long id, ReprogramarRequest r) {
    var p = get(id);
    ServiceSupport.version(p.getVersion(), r.version());
    if (p.getEstado() == EstadoProgramacion.CANCELADA || p.getEstado() == EstadoProgramacion.REALIZADA)
      throw new BusinessRuleException("La programación ya no admite reprogramación");
    if (repo.existeConflicto(id, r.fechaHoraPreparacion(), p.getIdChoferExterno(), p.getIdRepresentanteExterno(),
        p.getVehiculo() == null ? null : p.getVehiculo().getId(), EstadoProgramacion.CANCELADA,
        EstadoProgramacion.REALIZADA))
      throw new ConflictException("Existe conflicto de recursos en la fecha/hora solicitada");
    p.setFechaHoraPreparacion(r.fechaHoraPreparacion());
    p.setMotivoReprogramacion(r.motivo().trim());
    p = repo.saveAndFlush(p);
    return full(p);
  }

  @Transactional
  public ProgramacionResponse asignarRecursos(Long id, RecursosRequest r) {
    var p = get(id);
    ServiceSupport.version(p.getVersion(), r.version());
    if (p.getEstado() != EstadoProgramacion.PROGRAMADA)
      throw new BusinessRuleException("La programación no admite asignación de recursos en su estado actual");
    var v = vehRepo.findById(r.idVehiculo()).orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado"));
    if (!v.isActivo())
      throw new BusinessRuleException("El vehículo está inactivo");
    if (repo.existeConflicto(id, p.getFechaHoraPreparacion(), r.idChofer(), r.idRepresentante(), v.getId(),
        EstadoProgramacion.CANCELADA, EstadoProgramacion.REALIZADA))
      throw new ConflictException("Existe conflicto de vehículo, chofer o representante en la fecha/hora");
    p.setVehiculo(v);
    p.setIdChoferExterno(r.idChofer());
    p.setIdRepresentanteExterno(r.idRepresentante());
    p = repo.saveAndFlush(p);
    var aa = asig.findAllByProgramacionIdOrderByOrdenParadaAsc(id);
    for (var a : aa)
      if (a.getEstado() != EstadoAsignacion.CANCELADA)
        a.setEstado(EstadoAsignacion.PROGRAMADA);
    asig.saveAll(aa);
    asignarResponsables(p);
    for (var a : aa)
      if (a.getEstado() != EstadoAsignacion.CANCELADA) {
        var oc = ordenes.obtenerOrden(a.getIdOrdenExterno());
        ordenes.aplicarHito(a.getIdOrdenExterno(), HitoOrden.PROGRAMACION_CONFIRMADA, oc.version(), r.idSupervisor(),
            "Planeación y asignación confirmadas");
      }
    repo.flush();
    return full(p);
  }

  private void crearEtapas(ProgramacionLogistica p, OrdenLogisticaContext oc, List<FasePlanRequest> planes) {
    var duplicates = planes.stream().collect(Collectors.groupingBy(FasePlanRequest::codigoEtapa, Collectors.counting()))
        .entrySet().stream().filter(x -> x.getValue() > 1).findAny();
    if (duplicates.isPresent())
      throw new BusinessRuleException("No se permiten fases duplicadas");
    var m = planes.stream().collect(Collectors.toMap(FasePlanRequest::codigoEtapa, Function.identity()));
    Set<CodigoEtapa> aplic = oc.fasesAplicables() == null ? Set.of() : oc.fasesAplicables();
    int orden = 1;
    for (var c : CodigoEtapa.values()) {
      var e = new EtapaLogistica();
      e.setProgramacion(p);
      e.setCodigoEtapa(c);
      e.setOrdenEtapa(orden++);
      var t = tolRepo.findByCodigoEtapa(c)
          .orElseThrow(() -> new BusinessRuleException("No existe tolerancia configurada para " + c));
      e.setToleranciaAplicadaMinutos(t.isAplica() ? t.getMinutos() : null);
      if (c.esSistema()) {
        e.setEstado(EstadoEtapa.CONCLUIDA);
        e.setConfirmada(true);
        e.setFechaHoraInicio(LocalDateTime.now());
        e.setFechaHoraTermino(LocalDateTime.now());
        e.setComentario("Fase registrada por el sistema durante la programación");
      } else if (!aplic.contains(c)) {
        e.setEstado(EstadoEtapa.NO_APLICA);
        e.setConfirmada(false);
      } else {
        e.setEstado(EstadoEtapa.PENDIENTE);
        var f = m.get(c);
        if (!c.esTraslado() && (f == null || f.duracionPrevistaMinutos() == null))
          throw new BusinessRuleException("Falta duración prevista para " + c);
        if (c.esTraslado() && f != null && f.duracionPrevistaMinutos() != null)
          throw new BusinessRuleException("Los traslados no usan duración fija en minutos");
        if (f != null) {
          e.setDuracionPrevistaMinutos(f.duracionPrevistaMinutos());
          e.setCantidadPrevista(f.cantidadPrevista());
        }
      }
      etapaRepo.save(e);
    }
  }

  private void asignarResponsables(ProgramacionLogistica p) {
    for (var e : etapaRepo.findAllByProgramacionIdOrderByOrdenEtapaAsc(p.getId())) {
      if (e.getEstado() == EstadoEtapa.NO_APLICA || e.getCodigoEtapa().esSistema() || e.getCodigoEtapa().esInventario())
        continue;
      if (e.getCodigoEtapa().esChofer())
        e.setIdResponsableExterno(p.getIdChoferExterno());
      else if (e.getCodigoEtapa().esRepresentante())
        e.setIdResponsableExterno(p.getIdRepresentanteExterno());
    }
    etapaRepo.flush();
  }

  private ProgramacionLogistica get(Long id) {
    return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Programación no encontrada"));
  }

  private ProgramacionResponse full(ProgramacionLogistica p) {
    return map.programacion(p, asig.findAllByProgramacionIdOrderByOrdenParadaAsc(p.getId()),
        etapaRepo.findAllByProgramacionIdOrderByOrdenEtapaAsc(p.getId()));
  }
}
