package mx.com.mesaregia.cotizaciones.repository;

import mx.com.mesaregia.cotizaciones.domain.entity.HistorialEstadoCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface HistorialEstadoCotizacionRepository extends JpaRepository<HistorialEstadoCotizacion, Long> {
  List<HistorialEstadoCotizacion> findByIdCotizacionOrderByFechaHoraAsc(Long id);
}