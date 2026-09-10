package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.LimiteInventarioRequest; import mx.com.mesaregia.inventario.api.response.LimiteInventarioResponse;
public interface LimiteInventarioService { LimiteInventarioResponse configurar(Long idProducto, Long idAlmacen, LimiteInventarioRequest request); }