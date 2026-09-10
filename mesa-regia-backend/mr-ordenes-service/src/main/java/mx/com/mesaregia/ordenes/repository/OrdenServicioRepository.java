package mx.com.mesaregia.ordenes.repository;

import mx.com.mesaregia.ordenes.domain.entity.OrdenServicio;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface OrdenServicioRepository
    extends JpaRepository<OrdenServicio, Long>, JpaSpecificationExecutor<OrdenServicio> {
  Optional<OrdenServicio> findByIdCotizacionExternoAndIdCotizacionVersionExterno(Long c, Long v);

  Optional<OrdenServicio> findByFolio(String folio);
}
