package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.response.AlertaInventarioResponse; import mx.com.mesaregia.inventario.domain.enums.TipoAlertaInventario; import java.util.List;
public interface AlertaInventarioQueryService { List<AlertaInventarioResponse> consultar(Long idAlmacen, TipoAlertaInventario tipo); }