package mx.com.mesaregia.pagos.repository;
import mx.com.mesaregia.pagos.domain.entity.MovimientoCuenta; import mx.com.mesaregia.pagos.domain.enums.*; import org.springframework.data.domain.*; import org.springframework.data.jpa.domain.Specification; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.math.BigDecimal; import java.util.*;
public interface MovimientoCuentaRepository extends JpaRepository<MovimientoCuenta,Long>, JpaSpecificationExecutor<MovimientoCuenta> {
 @EntityGraph(attributePaths={"cuentaCobro","pago","movimientoOrigen","movimientoOrigen.pago"}) Optional<MovimientoCuenta> findByClaveOperacion(String claveOperacion);
 @EntityGraph(attributePaths={"cuentaCobro","pago","movimientoOrigen","movimientoOrigen.pago"}) @Query("select m from MovimientoCuenta m where m.id=:id") Optional<MovimientoCuenta> findDetailedById(@Param("id") Long id);
 @EntityGraph(attributePaths={"pago","movimientoOrigen","movimientoOrigen.pago"}) List<MovimientoCuenta> findByCuentaCobroIdAndTipoMovimientoInOrderByFechaHoraDesc(Long id,List<TipoMovimientoCuenta> tipos);
 @EntityGraph(attributePaths={"pago"}) Optional<MovimientoCuenta> findFirstByPagoIdAndTipoMovimientoOrderByIdAsc(Long idPago,TipoMovimientoCuenta tipo);
 @Query("select coalesce(sum(m.monto),0) from MovimientoCuenta m where m.cuentaCobro.id=:id and m.naturaleza=:naturaleza") BigDecimal totalNaturaleza(@Param("id") Long id,@Param("naturaleza") NaturalezaMovimiento naturaleza);
 boolean existsByCuentaCobroIdAndTipoMovimiento(Long id,TipoMovimientoCuenta tipo);
 Optional<MovimientoCuenta> findFirstByCuentaCobroIdAndTipoMovimientoOrderByIdDesc(Long id,TipoMovimientoCuenta tipo);
}
