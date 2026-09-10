package mx.com.mesaregia.seguridad.repository;
import mx.com.mesaregia.seguridad.domain.entity.RolPermisoAlcance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RolPermisoAlcanceRepository extends JpaRepository<RolPermisoAlcance,Long> {
 List<RolPermisoAlcance> findByRolIdOrderByPermisoModuloAscPermisoCodigoAsc(Long idRol);
 List<RolPermisoAlcance> findByActivoTrueOrderByRolCodigoAscPermisoModuloAscPermisoCodigoAsc();
}
