package mx.com.mesaregia.catalogo.integration.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NoOpDomainEventPublisher implements DomainEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(NoOpDomainEventPublisher.class);

    @Override
    public void publish(String eventType, Object payload) {
        log.debug("Evento de dominio pendiente de adapter durable: {}", eventType);
    }
}
