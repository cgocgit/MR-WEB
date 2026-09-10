package mx.com.mesaregia.seguridad.repository;

import java.time.LocalDateTime;
import mx.com.mesaregia.seguridad.domain.entity.EventoAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {

  @Query("""
      select e
      from EventoAuditoria e
      where (:desde is null or e.fechaHora >= :desde)
        and (:hasta is null or e.fechaHora <= :hasta)
        and (:idUsuario is null or e.usuario.id = :idUsuario)
        and (:modulo is null or e.modulo = :modulo)
        and (:accion is null or e.accion = :accion)
        and (:correlacion is null or e.idCorrelacion = :correlacion)
      order by e.fechaHora desc
      """)
  Page<EventoAuditoria> buscar(
      @Param("desde") LocalDateTime desde,
      @Param("hasta") LocalDateTime hasta,
      @Param("idUsuario") Long idUsuario,
      @Param("modulo") String modulo,
      @Param("accion") String accion,
      @Param("correlacion") String correlacion,
      Pageable pageable);
}
