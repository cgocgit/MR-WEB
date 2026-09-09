package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.AjusteInventarioRequest; import mx.com.mesaregia.inventario.api.response.MovimientoResponse;
public interface AjusteInventarioService { MovimientoResponse registrar(String idempotencyKey, AjusteInventarioRequest request); }