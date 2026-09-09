package mx.com.mesaregia.pagos.application.service; import mx.com.mesaregia.pagos.api.response.CuentaCobroResponse;
public interface CuentaCobroService { CuentaCobroResponse obtenerPorCotizacion(Long idCotizacion,Long idVersion); }
