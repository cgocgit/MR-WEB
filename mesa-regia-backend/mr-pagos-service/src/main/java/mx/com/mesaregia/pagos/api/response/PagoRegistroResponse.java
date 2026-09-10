package mx.com.mesaregia.pagos.api.response;
public record PagoRegistroResponse(Long idPago,String folioPago,boolean idempotente,boolean eventoImporteRequeridoGenerado,boolean comprobantePersistido,CuentaCobroResponse cuenta) {}
