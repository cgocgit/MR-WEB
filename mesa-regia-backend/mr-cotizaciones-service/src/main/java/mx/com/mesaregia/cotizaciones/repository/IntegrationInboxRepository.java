package mx.com.mesaregia.cotizaciones.repository;

import mx.com.mesaregia.cotizaciones.domain.entity.IntegrationInbox;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IntegrationInboxRepository extends JpaRepository<IntegrationInbox, Long> {
  boolean existsByEventId(String eventId);
}