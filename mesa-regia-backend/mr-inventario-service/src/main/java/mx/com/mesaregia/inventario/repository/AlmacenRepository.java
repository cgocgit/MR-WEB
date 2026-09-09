package mx.com.mesaregia.inventario.repository;
import mx.com.mesaregia.inventario.domain.entity.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AlmacenRepository extends JpaRepository<Almacen, Long> { Optional<Almacen> findByCodigo(String codigo); }
