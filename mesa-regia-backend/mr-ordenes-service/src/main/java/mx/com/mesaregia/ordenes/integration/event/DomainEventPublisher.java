package mx.com.mesaregia.ordenes.integration.event;

public interface DomainEventPublisher {
  void publish(OrdenEstadoCambiadoEvent event);
}