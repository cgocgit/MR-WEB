package mx.com.mesaregia.clientes.integration.event;

import java.util.Map;

public interface DomainEventPublisher {
  void publish(String eventType, Long aggregateId, Map<String, Object> attributes);
}
