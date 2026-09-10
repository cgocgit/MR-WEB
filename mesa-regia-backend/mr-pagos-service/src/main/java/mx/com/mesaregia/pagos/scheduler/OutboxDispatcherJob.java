package mx.com.mesaregia.pagos.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.pagos.domain.enums.EstadoOutbox;
import mx.com.mesaregia.pagos.integration.client.InternalRestClientFactory;
import mx.com.mesaregia.pagos.integration.event.ImporteRequeridoCubiertoEvent;
import mx.com.mesaregia.pagos.repository.IntegrationOutboxRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!test")
public class OutboxDispatcherJob {
  private final IntegrationOutboxRepository repo;
  private final ObjectMapper json;
  private final RestClient cot;

  public OutboxDispatcherJob(IntegrationOutboxRepository r, ObjectMapper j, InternalRestClientFactory f) {
    repo = r;
    json = j;
    cot = f.create(System.getenv().getOrDefault("MR_COTIZACIONES_BASE_URL", "http://localhost:8086"));
  }

  @Scheduled(fixedDelayString = "${MR_OUTBOX_DISPATCH_MS:10000}")
  public void run() {
    for (var e : repo.findTop50ByEstadoInAndProximoIntentoLessThanEqualOrderByIdAsc(
        List.of(EstadoOutbox.PENDIENTE, EstadoOutbox.ERROR), LocalDateTime.now())) {
      try {
        var p = json.readValue(e.getPayload(), ImporteRequeridoCubiertoEvent.class);
        cot.post().uri("/internal/v1/cotizaciones/eventos/importe-requerido-cubierto")
            .body(new Req(e.getEventId(), p.idCuentaCobro(), p.idCotizacion(), p.idCotizacionVersion(),
                p.acumuladoNeto(), p.importeRequerido(), p.correlationId()))
            .retrieve().toBodilessEntity();
        e.setEstado(EstadoOutbox.ENVIADO);
        e.setEnviadoEn(LocalDateTime.now());
        e.setUltimoError(null);
      } catch (Exception ex) {
        e.setEstado(EstadoOutbox.ERROR);
        e.setIntentos(e.getIntentos() + 1);
        e.setUltimoError(shorten(ex.getMessage()));
        e.setProximoIntento(
            LocalDateTime.now().plusSeconds(Math.min(3600, 10L * (1L << Math.min(e.getIntentos(), 8)))));
      }
      repo.save(e);
    }
  }

  private String shorten(String s) {
    return s == null ? null : s.substring(0, Math.min(1000, s.length()));
  }

  private record Req(String eventId, Long idCuentaCobro, Long idCotizacion, Long idCotizacionVersion,
      java.math.BigDecimal acumuladoNeto, java.math.BigDecimal importeRequerido, String correlationId) {
  }
}