package mx.com.mesaregia.logistica.repository;
import mx.com.mesaregia.logistica.domain.entity.ProgramacionLogistica; import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.time.LocalDateTime;
public interface ProgramacionLogisticaRepository extends JpaRepository<ProgramacionLogistica,Long>{
 @Query("""
 select p from ProgramacionLogistica p where (:estado is null or p.estado=:estado) and (:desde is null or p.fechaHoraPreparacion>=:desde) and (:hasta is null or p.fechaHoraPreparacion<=:hasta)
 """) Page<ProgramacionLogistica> buscar(@Param("estado") EstadoProgramacion estado,@Param("desde") LocalDateTime desde,@Param("hasta") LocalDateTime hasta,Pageable pageable);
 @Query("""
 select (count(p)>0) from ProgramacionLogistica p where p.id<>:id and p.estado not in (:cancelada,:realizada) and p.fechaHoraPreparacion=:fecha and ((:chofer is not null and p.idChoferExterno=:chofer) or (:representante is not null and p.idRepresentanteExterno=:representante) or (:vehiculoId is not null and p.vehiculo.id=:vehiculoId))
 """) boolean existeConflicto(@Param("id")Long id,@Param("fecha")LocalDateTime fecha,@Param("chofer")Long chofer,@Param("representante")Long representante,@Param("vehiculoId")Long vehiculoId,@Param("cancelada") EstadoProgramacion cancelada,@Param("realizada") EstadoProgramacion realizada);
}
