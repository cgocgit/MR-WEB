package mx.com.mesaregia.pagos.repository;

import mx.com.mesaregia.pagos.domain.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PagoRepository extends JpaRepository<Pago, Long> {
  Optional<Pago> findByClaveOperacion(String claveOperacion);
}
