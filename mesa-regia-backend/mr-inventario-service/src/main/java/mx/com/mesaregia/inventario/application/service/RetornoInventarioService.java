package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.RetornoInventarioRequest; import mx.com.mesaregia.inventario.api.response.OperacionInventarioResponse;
public interface RetornoInventarioService { OperacionInventarioResponse registrar(String idempotencyKey, RetornoInventarioRequest request); }