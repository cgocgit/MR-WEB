package mx.com.mesaregia.catalogo.repository;

import mx.com.mesaregia.catalogo.domain.entity.ListaPrecioDetalle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListaPrecioDetalleRepository extends JpaRepository<ListaPrecioDetalle, Long> {
    @EntityGraph(attributePaths = {"producto", "paquete"})
    List<ListaPrecioDetalle> findByListaPrecioIdOrderByIdAsc(Long idListaPrecio);
    Optional<ListaPrecioDetalle> findByListaPrecioIdAndProductoId(Long idListaPrecio, Long idProducto);
    Optional<ListaPrecioDetalle> findByListaPrecioIdAndPaqueteId(Long idListaPrecio, Long idPaquete);
}
