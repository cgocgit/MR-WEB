package mx.com.mesaregia.seguridad.repository;
import mx.com.mesaregia.seguridad.domain.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RolRepository extends JpaRepository<Rol,Long> { Optional<Rol> findByCodigo(String codigo); boolean existsByCodigoAndIdNot(String codigo, Long id); }
