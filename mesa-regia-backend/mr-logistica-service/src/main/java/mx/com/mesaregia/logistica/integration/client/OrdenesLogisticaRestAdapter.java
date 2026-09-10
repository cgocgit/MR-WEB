package mx.com.mesaregia.logistica.integration.client;

import mx.com.mesaregia.logistica.domain.enums.*;
import mx.com.mesaregia.logistica.exception.IntegrationUnavailableException;
import mx.com.mesaregia.logistica.integration.dto.OrdenLogisticaContext;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class OrdenesLogisticaRestAdapter implements OrdenesLogisticaPort {
  private final RestClient client;

  public OrdenesLogisticaRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_ORDENES_BASE_URL", "http://localhost:8087"));
  }

  @Override
  public OrdenLogisticaContext obtenerOrden(Long id) {
    try {
      var r = client.get().uri("/internal/v1/ordenes/{id}", id).retrieve().body(OrdenDto.class);
      if (r == null)
        throw new IntegrationUnavailableException("Respuesta vacía de Órdenes");
      Set<CodigoEtapa> fases = fases(r.tipoCompromiso());
      return new OrdenLogisticaContext(r.id(), r.folio(), r.estado(), r.version(), r.domicilio(), r.fechaHoraEvento(),
          fases);
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("mr-ordenes-service no disponible");
    }
  }

  @Override
  public void aplicarHito(Long id, HitoOrden h, Long version, Long usuario, String motivo) {
    try {
      client.post().uri("/internal/v1/ordenes/{id}/hitos", id).body(new HitoReq(h.name(), version, usuario, motivo))
          .retrieve().toBodilessEntity();
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("No fue posible comunicar hito a Órdenes");
    }
  }

  private Set<CodigoEtapa> fases(String tipo) {
    var all = EnumSet.allOf(CodigoEtapa.class);
    if ("SERVICIOS".equals(tipo)) {
      all.remove(CodigoEtapa.CARGA_DESPACHO);
      all.remove(CodigoEtapa.RECOLECCION);
      all.remove(CodigoEtapa.INSPECCION);
      all.remove(CodigoEtapa.ENTREGA_ALMACEN);
      all.remove(CodigoEtapa.LIMPIEZA_REACONDICIONAMIENTO);
      all.remove(CodigoEtapa.REINGRESO_INVENTARIO);
    }
    return all;
  }

  private record HitoReq(String hito, Long version, Long idUsuario, String motivo) {
  }

  private record OrdenDto(Long id, String folio, String estado, String tipoCompromiso, LocalDateTime fechaHoraEvento,
      String domicilio, Long version) {
  }
}
