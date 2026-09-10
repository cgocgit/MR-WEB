package mx.com.mesaregia.logistica.mapper;

import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.domain.entity.*;
import org.springframework.stereotype.Component;
import java.time.*;
import java.util.*;

@Component
public class LogisticaMapper {
  public VehiculoResponse vehiculo(Vehiculo v) {
    return v == null ? null : new VehiculoResponse(v.getId(), v.getPlaca(), v.isActivo(), v.getVersion());
  }

  public ToleranciaResponse tolerancia(Tolerancia t) {
    return new ToleranciaResponse(t.getId(), t.getCodigoEtapa(), t.getUnidad(), t.getMinutos(), t.isAplica(),
        t.isActivo(), t.getVersion());
  }

  public AsignacionResponse asignacion(AsignacionLogistica a) {
    return new AsignacionResponse(a.getId(), a.getIdOrdenExterno(), a.getOrdenParada(), a.getFechaHoraProgramada(),
        a.getDomicilioSnapshot(), a.getEstado());
  }

  public EtapaResponse etapa(EtapaLogistica e) {
    Integer pend = e.getCantidadPrevista() == null ? null
        : Math.max(0, e.getCantidadPrevista() - (e.getCantidadAtendida() == null ? 0 : e.getCantidadAtendida()));
    return new EtapaResponse(e.getId(), e.getCodigoEtapa(), e.getEstado(), e.getOrdenEtapa(),
        e.getToleranciaAplicadaMinutos(), e.getDuracionPrevistaMinutos(), e.getFechaHoraInicio(),
        e.getFechaHoraTermino(), e.getIdResponsableExterno(), e.getCantidadPrevista(), e.getCantidadAtendida(), pend,
        e.getComentario(), e.getEvidencia1Referencia(), e.getEvidencia2Referencia(), e.getEvidencia3Referencia(),
        e.isConfirmada(), fuera(e), e.getVersion());
  }

  private boolean fuera(EtapaLogistica e) {
    if (e.getCodigoEtapa().esTraslado() || e.getFechaHoraInicio() == null || e.getDuracionPrevistaMinutos() == null
        || e.getToleranciaAplicadaMinutos() == null)
      return false;
    var fin = e.getFechaHoraTermino() != null ? e.getFechaHoraTermino() : LocalDateTime.now();
    long m = Duration.between(e.getFechaHoraInicio(), fin).toMinutes();
    return m > ((long) e.getDuracionPrevistaMinutos() + e.getToleranciaAplicadaMinutos());
  }

  public ProgramacionResponse programacion(ProgramacionLogistica p, List<AsignacionLogistica> a,
      List<EtapaLogistica> e) {
    return new ProgramacionResponse(p.getId(), p.getFechaHoraPreparacion(), p.getIdSupervisorExterno(),
        p.getIdRepresentanteExterno(), p.getIdChoferExterno(), vehiculo(p.getVehiculo()), p.getEstado(),
        p.getMotivoReprogramacion(), p.getVersion(), a.stream().map(this::asignacion).toList(),
        e.stream().map(this::etapa).toList());
  }

  public RutaResponse ruta(ProgramacionLogistica p, List<AsignacionLogistica> a, List<EtapaLogistica> e) {
    return new RutaResponse(p.getId(), p.getFechaHoraPreparacion(), p.getEstado(),
        p.getVehiculo() == null ? null : p.getVehiculo().getPlaca(), p.getIdChoferExterno(),
        p.getIdRepresentanteExterno(), a.stream().map(this::asignacion).toList(), e.stream().map(this::etapa).toList());
  }

  public MisOperacionResponse operacion(AsignacionLogistica a) {
    var p = a.getProgramacion();
    return new MisOperacionResponse(a.getId(), p.getId(), a.getIdOrdenExterno(), a.getOrdenParada(),
        p.getFechaHoraPreparacion(), a.getFechaHoraProgramada(),
        p.getVehiculo() == null ? null : p.getVehiculo().getPlaca(), p.getEstado(), a.getEstado());
  }

  public TipoIncidenciaResponse tipo(TipoIncidencia t) {
    return new TipoIncidenciaResponse(t.getId(), t.getCodigo(), t.getNombre(), t.getPerfilReportante());
  }

  public SeguimientoResponse seguimiento(SeguimientoIncidencia s) {
    return new SeguimientoResponse(s.getId(), s.getEstadoAnterior(), s.getEstadoNuevo(), s.getComentario(),
        s.getIdUsuarioExterno(), s.getFechaHora());
  }

  public IncidenciaResponse incidencia(Incidencia i, List<SeguimientoIncidencia> s) {
    return new IncidenciaResponse(i.getId(), i.getFolio(), i.getProgramacion().getId(),
        i.getEtapa() == null ? null : i.getEtapa().getId(), i.getTipo().getId(), i.getTipo().getCodigo(),
        i.getIdOrdenExterno(), i.getIdProductoExterno(), i.getCantidadAfectada(), i.getEstado(), i.getDescripcion(),
        i.getIdUsuarioReportaExterno(), i.getIdSupervisorExterno(), i.getResolucion(), i.getFechaHoraReporte(),
        i.getFechaHoraResolucion(), i.getVersion(), s.stream().map(this::seguimiento).toList());
  }
}
