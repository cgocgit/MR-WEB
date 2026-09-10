package mx.com.mesaregia.ordenes.repository;

import mx.com.mesaregia.ordenes.domain.entity.HistorialEstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface HistorialEstadoOrdenRepository extends JpaRepository<HistorialEstadoOrden, Long> {
  List<HistorialEstadoOrden> findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(Long idOrden);

  boolean existsByOrdenServicio_IdAndAccion(Long idOrden, String accion);
}
