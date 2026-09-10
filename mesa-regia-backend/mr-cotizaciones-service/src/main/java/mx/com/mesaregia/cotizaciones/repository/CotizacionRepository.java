package mx.com.mesaregia.cotizaciones.repository;

import mx.com.mesaregia.cotizaciones.domain.entity.Cotizacion;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long>, JpaSpecificationExecutor<Cotizacion> {
  @Query("select max(c.consecutivo) from Cotizacion c where c.ejercicio=:ejercicio")
  Long maxConsecutivo(@Param("ejercicio") Integer ejercicio);

  Optional<Cotizacion> findByFolio(String folio);
}
