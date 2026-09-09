package mx.com.mesaregia.catalogo.integration.event;

public interface DomainEventPublisher {
    void publish(String eventType, Object payload);
}
