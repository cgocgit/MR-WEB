package mx.com.mesaregia.logistica.repository; import mx.com.mesaregia.logistica.domain.entity.Incidencia; import mx.com.mesaregia.logistica.domain.enums.EstadoIncidencia; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface IncidenciaRepository extends JpaRepository<Incidencia,Long>{
 @Query("""
 select i from Incidencia i where (:estado is null or i.estado=:estado) and (:idOrden is null or i.idOrdenExterno=:idOrden) and (:idProgramacion is null or i.programacion.id=:idProgramacion) order by i.fechaHoraReporte desc
 """) Page<Incidencia> buscar(@Param("estado")EstadoIncidencia estado,@Param("idOrden")Long idOrden,@Param("idProgramacion")Long idProgramacion,Pageable p);
 long countByFolioStartingWith(String p);
}
