package mx.com.mesaregia.ordenes.application.service.impl;

import mx.com.mesaregia.ordenes.api.request.OrdenCreateRequest;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;
import mx.com.mesaregia.ordenes.application.service.OrdenCommandService;
import mx.com.mesaregia.ordenes.domain.entity.OrdenDetalle;
import mx.com.mesaregia.ordenes.domain.entity.OrdenServicio;
import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden;
import mx.com.mesaregia.ordenes.domain.enums.TipoConcepto;
import mx.com.mesaregia.ordenes.exception.BusinessRuleException;
import mx.com.mesaregia.ordenes.mapper.OrdenMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class OrdenCommandServiceImpl implements OrdenCommandService {

  private final OrdenSupport support;
  private final OrdenMapper mapper;

  public OrdenCommandServiceImpl(OrdenSupport support, OrdenMapper mapper) {
    this.support = support;
    this.mapper = mapper;
  }

  @Override
  @Transactional
  public OrdenResponse generarDesdeCotizacion(OrdenCreateRequest request, String correlationId) {
    var existing = support.orders().findByIdCotizacionExternoAndIdCotizacionVersionExterno(
        request.idCotizacion(), request.idCotizacionVersion());
    if (existing.isPresent()) {
      return response(existing.get());
    }
    if (request.detalles() == null || request.detalles().isEmpty()) {
      throw new BusinessRuleException("La Orden requiere al menos un concepto confirmado");
    }

    validarJerarquia(request);

    var orden = new OrdenServicio();
    orden.setFolio("TMP-" + UUID.randomUUID());
    orden.setEstado(EstadoOrden.EN_REVISION_VENTAS);
    orden.setTipoCompromiso(request.tipoCompromiso());
    orden.setIdCotizacionExterno(request.idCotizacion());
    orden.setIdCotizacionVersionExterno(request.idCotizacionVersion());
    orden.setIdClienteProspectoExterno(request.idClienteProspecto());
    orden.setClienteSnapshot(request.clienteSnapshot().trim());
    orden.setContactoSnapshot(request.contactoSnapshot());
    orden.setEventoSnapshot(request.eventoSnapshot().trim());
    orden.setFechaHoraEventoSnapshot(request.fechaHoraEventoSnapshot());
    orden.setDomicilioEventoSnapshot(request.domicilioEventoSnapshot().trim());
    orden.setObservaciones(request.observaciones());
    orden.setReferenciaPagoExterna(request.referenciaPago());
    orden.setReferenciaReservaExterna(request.referenciaReserva());
    support.orders().saveAndFlush(orden);

    orden.setFolio("OSMR-" + String.format("%02d", Year.now().getValue() % 100)
        + "-" + String.format("%06d", orden.getId()));
    support.orders().saveAndFlush(orden);

    var persisted = persistirDetalles(orden, request);
    support.history(orden, null, EstadoOrden.EN_REVISION_VENTAS,
        "ORDEN_GENERADA_DESDE_COTIZACION", "Cotización confirmada", null);

    return mapper.full(orden, persisted,
        support.historyRepo().findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(orden.getId()));
  }

  private void validarJerarquia(OrdenCreateRequest request) {
    Set<String> claves = new HashSet<>();
    for (var detalle : request.detalles()) {
      if (detalle.claveTemporal() != null && !detalle.claveTemporal().isBlank()
          && !claves.add(detalle.claveTemporal())) {
        throw new BusinessRuleException("No se permiten claves temporales de detalle duplicadas");
      }
    }
    for (var detalle : request.detalles()) {
      if (detalle.clavePadreTemporal() != null && !detalle.clavePadreTemporal().isBlank()) {
        if (detalle.tipoConcepto() == TipoConcepto.PAQUETE) {
          throw new BusinessRuleException("Un PAQUETE no puede ser componente de otro PAQUETE");
        }
        if (!claves.contains(detalle.clavePadreTemporal())) {
          throw new BusinessRuleException("El detalle padre temporal no existe en la misma Orden");
        }
        if (detalle.clavePadreTemporal().equals(detalle.claveTemporal())) {
          throw new BusinessRuleException("Un detalle no puede ser padre de sí mismo");
        }
      }
    }
  }

  private List<OrdenDetalle> persistirDetalles(OrdenServicio orden, OrdenCreateRequest request) {
    Map<String, OrdenDetalle> porClave = new HashMap<>();
    List<OrdenDetalle> persisted = new ArrayList<>();
    int posicion = 1;

    // Primera pasada: persiste cada snapshot sin relación padre.
    for (var detalle : request.detalles()) {
      var entity = new OrdenDetalle();
      entity.setOrdenServicio(orden);
      entity.setTipoConcepto(detalle.tipoConcepto());
      entity.setIdConceptoExterno(detalle.idConceptoExterno());
      entity.setCodigoSnapshot(detalle.codigoSnapshot());
      entity.setNombreSnapshot(detalle.nombreSnapshot().trim());
      entity.setCantidad(detalle.cantidad());
      entity.setOrdenVisual(detalle.orden() == null ? posicion : detalle.orden());
      var saved = support.details().save(entity);
      persisted.add(saved);
      if (detalle.claveTemporal() != null && !detalle.claveTemporal().isBlank()) {
        porClave.put(detalle.claveTemporal(), saved);
      }
      posicion++;
    }

    // Segunda pasada: enlaza componentes de paquete usando únicamente claves
    // temporales del request.
    boolean requiereFlush = false;
    for (int i = 0; i < request.detalles().size(); i++) {
      var source = request.detalles().get(i);
      if (source.clavePadreTemporal() == null || source.clavePadreTemporal().isBlank()) {
        continue;
      }
      var parent = porClave.get(source.clavePadreTemporal());
      if (parent == null || parent.getTipoConcepto() != TipoConcepto.PAQUETE) {
        throw new BusinessRuleException("Los detalles hijos solo pueden depender de un detalle PAQUETE");
      }
      persisted.get(i).setDetallePadre(parent);
      requiereFlush = true;
    }
    if (requiereFlush) {
      support.details().flush();
    }
    return persisted;
  }

  private OrdenResponse response(OrdenServicio orden) {
    return mapper.full(orden,
        support.details().findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(orden.getId()),
        support.historyRepo().findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(orden.getId()));
  }
}
