package mx.com.mesaregia.pagos.api.response;
public record CompensacionResponse(Long idMovimiento,String folioMovimiento,boolean idempotente,Long idPagoOriginal,String folioPagoOriginal,CuentaCobroResponse cuenta) {}
