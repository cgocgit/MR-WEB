package mx.com.mesaregia.clientes.integration.event;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class LoggingDomainEventPublisher implements DomainEventPublisher {
    @Override
    public void publish(String eventType, Long aggregateId, Map<String, Object> attributes) {
        log.info("domainEvent={} aggregateId={} correlationId={} attributes={}",
                eventType, aggregateId, MDC.get("correlationId"), attributes);
    }
}
