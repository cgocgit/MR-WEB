package mx.com.mesaregia.logistica.repository;

import mx.com.mesaregia.logistica.domain.entity.EtapaLogistica;
import mx.com.mesaregia.logistica.domain.enums.CodigoEtapa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EtapaLogisticaRepository extends JpaRepository<EtapaLogistica, Long> {
  List<EtapaLogistica> findAllByProgramacionIdOrderByOrdenEtapaAsc(Long id);

  Optional<EtapaLogistica> findByProgramacionIdAndCodigoEtapa(Long p, CodigoEtapa c);
}
