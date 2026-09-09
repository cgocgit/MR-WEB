package mx.com.mesaregia.inventario.repository;

import jakarta.persistence.LockModeType;
import mx.com.mesaregia.inventario.domain.entity.CorteFisico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CorteFisicoRepository extends JpaRepository<CorteFisico, Long> {

    @EntityGraph(attributePaths = "almacen")
    Page<CorteFisico> findAllByOrderByIdDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"almacen", "detalles", "detalles.existencia"})
    @Query("select distinct c from CorteFisico c where c.id = :id")
    Optional<CorteFisico> findWithDetailsById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"almacen", "detalles", "detalles.existencia"})
    @Query("select distinct c from CorteFisico c where c.id = :id")
    Optional<CorteFisico> findForUpdate(@Param("id") Long id);
}
