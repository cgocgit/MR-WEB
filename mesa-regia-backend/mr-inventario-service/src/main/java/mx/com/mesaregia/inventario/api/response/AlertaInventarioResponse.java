package mx.com.mesaregia.inventario.api.response;

import mx.com.mesaregia.inventario.domain.enums.TipoAlertaInventario;
import java.time.LocalDateTime;

public record AlertaInventarioResponse(Long idExistencia, Long idProducto, Long idAlmacen, TipoAlertaInventario tipo,
    Integer existenciaFisica, Integer minimo, Integer maximo, Integer diferencia, LocalDateTime actualizadoEn) {
}
