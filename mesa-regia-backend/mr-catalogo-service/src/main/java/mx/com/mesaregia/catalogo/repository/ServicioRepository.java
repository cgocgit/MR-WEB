package mx.com.mesaregia.catalogo.repository;

import mx.com.mesaregia.catalogo.domain.entity.Servicio;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface ServicioRepository extends JpaRepository<Servicio, Long>, JpaSpecificationExecutor<Servicio> {
    @Override
    @EntityGraph(attributePaths = {"categoria"})
    Optional<Servicio> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"categoria"})
    Page<Servicio> findAll(Specification<Servicio> spec, Pageable pageable);
    Optional<Servicio> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
