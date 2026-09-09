package mx.com.mesaregia.inventario.repository;
import mx.com.mesaregia.inventario.domain.entity.CorteDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface CorteDetalleRepository extends JpaRepository<CorteDetalle, Long> {
    List<CorteDetalle> findAllByCorteFisicoIdOrderById(Long idCorte);
    Optional<CorteDetalle> findByCorteFisicoIdAndExistenciaId(Long idCorte, Long idExistencia);
}
