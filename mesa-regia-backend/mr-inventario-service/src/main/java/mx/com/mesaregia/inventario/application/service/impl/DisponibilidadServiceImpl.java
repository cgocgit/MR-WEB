package mx.com.mesaregia.inventario.application.service.impl;
import mx.com.mesaregia.inventario.application.service.DisponibilidadService; import mx.com.mesaregia.inventario.api.response.DisponibilidadResponse;
import mx.com.mesaregia.inventario.exception.BusinessRuleException; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.time.LocalDate;
@Service
public class DisponibilidadServiceImpl implements DisponibilidadService {
 private final InventorySupport support; public DisponibilidadServiceImpl(InventorySupport s){support=s;}
 @Override @Transactional(readOnly=true) public DisponibilidadResponse consultarFutura(Long producto, Long almacen, LocalDate inicio, LocalDate fin, Integer cantidad){
   if(inicio==null||fin==null||fin.isBefore(inicio)) throw new BusinessRuleException("El periodo de disponibilidad es inválido");
   if(cantidad==null||cantidad<=0) throw new BusinessRuleException("La cantidad debe ser mayor que cero");
   var e=support.existencia(almacen,producto); int r=support.reservada(e.getId(),inicio,fin); int disp=Math.max(0,e.getExistenciaFisica()-r);
   return new DisponibilidadResponse(producto,almacen,inicio,fin,e.getExistenciaFisica(),r,disp,cantidad,disp>=cantidad);
 }
}
