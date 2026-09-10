package mx.com.mesaregia.seguridad.repository;

import mx.com.mesaregia.seguridad.domain.entity.Permiso;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {
  Optional<Permiso> findByCodigo(String codigo);

  @Query("select p from Permiso p where (:activo is null or p.activo=:activo) and (:modulo is null or lower(p.modulo)=lower(:modulo))")
  Page<Permiso> buscar(@Param("activo") Boolean activo, @Param("modulo") String modulo, Pageable pageable);
}
