package mx.com.mesaregia.seguridad.repository;
import mx.com.mesaregia.seguridad.domain.entity.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema,Long>{ Optional<ConfiguracionSistema> findByClave(String clave); }
