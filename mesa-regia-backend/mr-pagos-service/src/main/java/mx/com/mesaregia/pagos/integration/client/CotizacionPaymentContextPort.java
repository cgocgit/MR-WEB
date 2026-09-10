package mx.com.mesaregia.pagos.integration.client; import mx.com.mesaregia.pagos.integration.dto.CotizacionPaymentContext;
public interface CotizacionPaymentContextPort { CotizacionPaymentContext obtener(Long idCotizacion,Long idVersion); }
