package mx.com.mesaregia.inventario.repository;

import mx.com.mesaregia.inventario.domain.entity.LimiteInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LimiteInventarioRepository extends JpaRepository<LimiteInventario, Long> {
  Optional<LimiteInventario> findByExistenciaId(Long idExistencia);
}
