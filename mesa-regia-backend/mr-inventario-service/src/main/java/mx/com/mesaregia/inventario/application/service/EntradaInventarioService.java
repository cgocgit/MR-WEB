package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.EntradaInventarioRequest; import mx.com.mesaregia.inventario.api.response.MovimientoResponse;
public interface EntradaInventarioService { MovimientoResponse registrar(String idempotencyKey, EntradaInventarioRequest request); }