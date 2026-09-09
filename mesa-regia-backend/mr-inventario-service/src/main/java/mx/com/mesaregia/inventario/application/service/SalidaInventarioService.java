package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.SalidaInventarioRequest; import mx.com.mesaregia.inventario.api.response.OperacionInventarioResponse;
public interface SalidaInventarioService { OperacionInventarioResponse registrar(String idempotencyKey, SalidaInventarioRequest request); }