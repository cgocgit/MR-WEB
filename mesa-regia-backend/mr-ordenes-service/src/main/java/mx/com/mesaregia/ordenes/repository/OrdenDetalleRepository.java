package mx.com.mesaregia.ordenes.repository; import mx.com.mesaregia.ordenes.domain.entity.OrdenDetalle; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface OrdenDetalleRepository extends JpaRepository<OrdenDetalle,Long>{ List<OrdenDetalle> findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(Long idOrden); }
