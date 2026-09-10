package mx.com.mesaregia.inventario.repository;

import mx.com.mesaregia.inventario.domain.entity.MovimientoInventario;
import mx.com.mesaregia.inventario.domain.enums.OrigenOperacion;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long>, JpaSpecificationExecutor<MovimientoInventario> {
    Optional<MovimientoInventario> findByClaveOperacion(String claveOperacion);
    List<MovimientoInventario> findTop10ByExistenciaIdOrderByFechaHoraDesc(Long idExistencia);
    @Query("""
      select coalesce(sum(m.cantidad),0) from MovimientoInventario m
      where m.idOrdenExterno=:orden and m.existencia.id=:existencia and m.origenOperacion=:origen
      """)
    Long sumCantidad(@Param("orden") Long orden, @Param("existencia") Long existencia, @Param("origen") OrigenOperacion origen);
}
