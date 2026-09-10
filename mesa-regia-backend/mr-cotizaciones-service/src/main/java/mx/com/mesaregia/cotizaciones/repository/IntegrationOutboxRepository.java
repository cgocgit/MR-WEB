package mx.com.mesaregia.cotizaciones.repository;

import mx.com.mesaregia.cotizaciones.domain.entity.IntegrationOutbox;
import mx.com.mesaregia.cotizaciones.domain.enums.EstadoOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.*;

public interface IntegrationOutboxRepository extends JpaRepository<IntegrationOutbox, Long> {
  List<IntegrationOutbox> findTop50ByEstadoInAndProximoIntentoLessThanEqualOrderByIdAsc(
      Collection<EstadoOutbox> estados, LocalDateTime now);
}