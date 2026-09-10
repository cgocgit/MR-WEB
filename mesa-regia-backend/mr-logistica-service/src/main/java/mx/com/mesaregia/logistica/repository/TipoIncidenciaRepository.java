package mx.com.mesaregia.logistica.repository;

import mx.com.mesaregia.logistica.domain.entity.TipoIncidencia;
import mx.com.mesaregia.logistica.domain.enums.PerfilReportante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TipoIncidenciaRepository extends JpaRepository<TipoIncidencia, Long> {
  List<TipoIncidencia> findAllByPerfilReportanteAndActivoTrueOrderByNombreAsc(PerfilReportante p);

  Optional<TipoIncidencia> findByCodigo(String c);
}
