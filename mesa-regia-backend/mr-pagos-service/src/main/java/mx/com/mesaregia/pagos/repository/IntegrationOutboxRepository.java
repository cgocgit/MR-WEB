package mx.com.mesaregia.pagos.repository;

import mx.com.mesaregia.pagos.domain.entity.IntegrationOutbox;
import mx.com.mesaregia.pagos.domain.enums.EstadoOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.*;

public interface IntegrationOutboxRepository extends JpaRepository<IntegrationOutbox, Long> {
  List<IntegrationOutbox> findTop50ByEstadoInAndProximoIntentoLessThanEqualOrderByIdAsc(Collection<EstadoOutbox> e,
      LocalDateTime n);
}