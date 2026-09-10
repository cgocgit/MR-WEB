package mx.com.mesaregia.pagos.repository;
import mx.com.mesaregia.pagos.domain.entity.CuentaCobro; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import jakarta.persistence.LockModeType; import java.util.*;
public interface CuentaCobroRepository extends JpaRepository<CuentaCobro,Long> {
 Optional<CuentaCobro> findByIdCotizacionExternoAndIdCotizacionVersionExterno(Long c,Long v);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select c from CuentaCobro c where c.id=:id") Optional<CuentaCobro> findForUpdate(@Param("id") Long id);
}
