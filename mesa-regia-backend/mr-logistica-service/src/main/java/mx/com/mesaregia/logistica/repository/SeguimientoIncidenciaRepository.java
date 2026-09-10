package mx.com.mesaregia.logistica.repository;

import mx.com.mesaregia.logistica.domain.entity.SeguimientoIncidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SeguimientoIncidenciaRepository extends JpaRepository<SeguimientoIncidencia, Long> {
  List<SeguimientoIncidencia> findAllByIncidenciaIdOrderByFechaHoraAsc(Long id);
}
