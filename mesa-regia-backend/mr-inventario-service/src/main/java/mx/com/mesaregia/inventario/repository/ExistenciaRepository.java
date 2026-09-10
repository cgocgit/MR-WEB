package mx.com.mesaregia.inventario.repository;

import jakarta.persistence.LockModeType;
import mx.com.mesaregia.inventario.domain.entity.Existencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ExistenciaRepository extends JpaRepository<Existencia, Long> {
  @EntityGraph(attributePaths = "almacen")
  Page<Existencia> findAllByAlmacenId(Long idAlmacen, Pageable pageable);

  @EntityGraph(attributePaths = "almacen")
  Optional<Existencia> findByAlmacenIdAndIdProductoExterno(Long idAlmacen, Long idProductoExterno);

  @EntityGraph(attributePaths = "almacen")
  List<Existencia> findAllByAlmacenIdOrderByIdProductoExterno(Long idAlmacen);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select e from Existencia e join fetch e.almacen where e.almacen.id=:almacen and e.idProductoExterno=:producto")
  Optional<Existencia> findForUpdate(@Param("almacen") Long idAlmacen, @Param("producto") Long idProductoExterno);
}
