package mx.com.mesaregia.catalogo.repository;

import mx.com.mesaregia.catalogo.domain.entity.PaqueteDetalle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaqueteDetalleRepository extends JpaRepository<PaqueteDetalle, Long> {
    @EntityGraph(attributePaths = {"producto", "servicio"})
    List<PaqueteDetalle> findByPaqueteIdOrderByOrdenAscIdAsc(Long idPaquete);

    @Query("select d.paquete.id as idPaquete, count(d.id) as cantidad from PaqueteDetalle d where d.paquete.id in :ids group by d.paquete.id")
    List<PaqueteComponenteCount> countByPaqueteIds(@Param("ids") List<Long> ids);
    long countByPaqueteId(Long idPaquete);
    void deleteByPaqueteId(Long idPaquete);
}
