package mx.com.mesaregia.pagos.application.service; import mx.com.mesaregia.pagos.api.request.CompensacionCreateRequest; import mx.com.mesaregia.pagos.api.response.CompensacionResponse;
public interface MovimientoCuentaService { CompensacionResponse compensar(Long idPago,String idempotencyKey,CompensacionCreateRequest request); }
