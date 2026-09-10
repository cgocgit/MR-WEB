package mx.com.mesaregia.pagos.integration.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.pagos.domain.entity.IntegrationOutbox;
import mx.com.mesaregia.pagos.repository.IntegrationOutboxRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Component
public class OutboxDomainEventPublisher implements DomainEventPublisher {
  private final IntegrationOutboxRepository repo;
  private final ObjectMapper json;

  public OutboxDomainEventPublisher(IntegrationOutboxRepository r, ObjectMapper j) {
    repo = r;
    json = j;
  }

  @Override
  @Transactional
  public void publish(ImporteRequeridoCubiertoEvent event) {
    try {
      var e = new IntegrationOutbox();
      e.setEventId(UUID.randomUUID().toString());
      e.setTipo("IMPORTE_REQUERIDO_CUBIERTO");
      e.setPayload(json.writeValueAsString(event));
      repo.save(e);
    } catch (Exception ex) {
      throw new IllegalStateException("No fue posible persistir evento Outbox", ex);
    }
  }
}