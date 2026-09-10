package mx.com.mesaregia.ordenes.scheduler;

import mx.com.mesaregia.ordenes.domain.enums.EstadoOutbox;
import mx.com.mesaregia.ordenes.integration.client.InternalRestClientFactory;
import mx.com.mesaregia.ordenes.repository.IntegrationOutboxRepository;
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
  private final RestClient security;

  public OutboxDispatcherJob(IntegrationOutboxRepository r, InternalRestClientFactory f) {
    repo = r;
    security = f.create(System.getenv().getOrDefault("MR_SEGURIDAD_BASE_URL", "http://localhost:8081"));
  }

  @Scheduled(fixedDelayString = "${MR_OUTBOX_DISPATCH_MS:10000}")
  public void run() {
    for (var e : repo.findTop50ByEstadoInAndProximoIntentoLessThanEqualOrderByIdAsc(
        List.of(EstadoOutbox.PENDIENTE, EstadoOutbox.ERROR), LocalDateTime.now())) {
      try {
        security.post().uri("/internal/v1/auditoria")
            .body(new Req("ORDENES", e.getTipo(), "ORDEN", e.getEventId(), null, e.getPayload(), null)).retrieve()
            .toBodilessEntity();
        e.setEstado(EstadoOutbox.ENVIADO);
        e.setEnviadoEn(LocalDateTime.now());
        e.setUltimoError(null);
      } catch (RuntimeException ex) {
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

  private record Req(String modulo, String accion, String tipoRecurso, String identificadorRecurso, String motivo,
      String detalle, String correlationId) {
  }
}