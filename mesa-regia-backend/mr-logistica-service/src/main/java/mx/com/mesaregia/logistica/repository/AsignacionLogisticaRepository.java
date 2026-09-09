package mx.com.mesaregia.logistica.repository;
import mx.com.mesaregia.logistica.domain.entity.AsignacionLogistica; import mx.com.mesaregia.logistica.domain.enums.EstadoAsignacion; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface AsignacionLogisticaRepository extends JpaRepository<AsignacionLogistica,Long>{
 List<AsignacionLogistica> findAllByProgramacionIdOrderByOrdenParadaAsc(Long id); Optional<AsignacionLogistica> findByProgramacionIdAndIdOrdenExterno(Long idProgramacion,Long idOrden); boolean existsByProgramacionIdAndOrdenParadaAndEstadoNot(Long id,Integer orden,EstadoAsignacion estado);
 @Query("""
 select a from AsignacionLogistica a join fetch a.programacion p left join fetch p.vehiculo where a.estado<>:cancelada and ((:perfil='CHOFER' and p.idChoferExterno=:idUsuario) or (:perfil='REPRESENTANTE' and p.idRepresentanteExterno=:idUsuario)) order by p.fechaHoraPreparacion asc,a.ordenParada asc
 """) List<AsignacionLogistica> misOperaciones(@Param("idUsuario")Long idUsuario,@Param("perfil")String perfil,@Param("cancelada") EstadoAsignacion cancelada);
 List<AsignacionLogistica> findAllByIdOrdenExternoAndEstadoNot(Long idOrden,EstadoAsignacion estado);
}
