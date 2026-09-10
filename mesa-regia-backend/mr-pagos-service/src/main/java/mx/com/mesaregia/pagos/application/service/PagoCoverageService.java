package mx.com.mesaregia.pagos.application.service; import mx.com.mesaregia.pagos.domain.entity.*;
public interface PagoCoverageService { boolean evaluarYPublicar(CuentaCobro cuenta,Pago pago); void recalcularSinPublicar(CuentaCobro cuenta); }
