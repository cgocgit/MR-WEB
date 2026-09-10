package mx.com.mesaregia.cotizaciones.integration.client;

import mx.com.mesaregia.cotizaciones.exception.IntegrationUnavailableException;
import mx.com.mesaregia.cotizaciones.integration.dto.ReservaResultado;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.time.*;
import java.util.*;

@Component
public class InventarioReservationRestAdapter implements InventarioReservationPort {
  private final RestClient client;
  private final Long almacen = Long.valueOf(System.getenv().getOrDefault("MR_INVENTARIO_ALMACEN_DEFAULT_ID", "1"));

  public InventarioReservationRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_INVENTARIO_BASE_URL", "http://localhost:8084"));
  }

  @Override
  public ReservaResultado reservar(String key, Long c, Long v, LocalDate fecha, LocalTime hora, List<Item> items) {
    try {
      var ds = items.stream().map(i -> new Detalle(almacen, i.idProducto(), i.cantidad().intValueExact())).toList();
      var req = new ReservaReq(null, key, c, v, fecha, fecha, ds, null);
      var r = client.post().uri("/internal/v1/reservas").header("Idempotency-Key", key).body(req).retrieve()
          .body(ReservaDto.class);
      if (r == null)
        throw new IntegrationUnavailableException("Respuesta vacía de Inventario");
      return new ReservaResultado(r.id(), r.folio());
    } catch (ArithmeticException e) {
      throw new mx.com.mesaregia.cotizaciones.exception.BusinessRuleException(
          "Inventario solo admite cantidades enteras");
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("mr-inventario-service no disponible");
    }
  }

  @Override
  public void vincularOrden(Long idReserva, Long idOrden, Long usuario) {
    try {
      client.post().uri("/internal/v1/reservas/{id}/vincular-orden", idReserva).body(new Vincular(idOrden, usuario))
          .retrieve().toBodilessEntity();
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("No fue posible vincular reserva con Orden");
    }
  }

  @Override
  public void liberar(Long idReserva, String motivo, Long usuario) {
    try {
      client.post().uri("/internal/v1/reservas/{id}/liberar", idReserva).body(new Liberar(motivo, true, usuario))
          .retrieve().toBodilessEntity();
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("No fue posible compensar la reserva");
    }
  }

  private record Detalle(Long idAlmacen, Long idProducto, Integer cantidad) {
  }

  private record ReservaReq(Long idOrdenExterno, String claveConfirmacion, Long idCotizacionExterno,
      Long idVersionExterna, LocalDate fechaInicio, LocalDate fechaFin, List<Detalle> detalles, Long idUsuarioExterno) {
  }

  private record ReservaDto(Long id, String folio) {
  }

  private record Vincular(Long idOrdenExterno, Long idUsuarioExterno) {
  }

  private record Liberar(String motivo, boolean cancelacion, Long idUsuarioExterno) {
  }
}
