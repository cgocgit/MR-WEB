package mx.com.mesaregia.pagos.repository;

import mx.com.mesaregia.pagos.domain.entity.AplicacionPago;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface AplicacionPagoRepository extends JpaRepository<AplicacionPago, Long> {
  @EntityGraph(attributePaths = { "pago", "cuentaCobro" })
  Optional<AplicacionPago> findFirstByPagoId(Long idPago);

  @EntityGraph(attributePaths = { "pago" })
  List<AplicacionPago> findByCuentaCobroIdOrderByFechaHoraAplicacionDesc(Long idCuenta);
}
