package mx.com.mesaregia.catalogo.repository;

import mx.com.mesaregia.catalogo.domain.entity.Producto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {
    @Override
    @EntityGraph(attributePaths = {"categoria", "tipoProducto", "color"})
    Optional<Producto> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"categoria", "tipoProducto", "color"})
    Page<Producto> findAll(Specification<Producto> spec, Pageable pageable);
    Optional<Producto> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
