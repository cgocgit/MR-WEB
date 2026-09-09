package mx.com.mesaregia.inventario.application.service.impl;

import mx.com.mesaregia.inventario.application.service.*; import mx.com.mesaregia.inventario.api.response.*; import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import mx.com.mesaregia.inventario.mapper.InventarioMapper; import mx.com.mesaregia.inventario.repository.*; import org.springframework.data.domain.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate; import java.util.*;
@Service
public class ExistenciaQueryServiceImpl implements ExistenciaQueryService {
 private final ExistenciaRepository er; private final LimiteInventarioRepository lr; private final ReservaRepository rr; private final MovimientoInventarioRepository mr; private final InventorySupport support; private final ReservaQueryService reservaQuery;
 public ExistenciaQueryServiceImpl(ExistenciaRepository er, LimiteInventarioRepository lr, ReservaRepository rr, MovimientoInventarioRepository mr, InventorySupport support, ReservaQueryService rq){this.er=er;this.lr=lr;this.rr=rr;this.mr=mr;this.support=support;this.reservaQuery=rq;}
 private ExistenciaResponse map(mx.com.mesaregia.inventario.domain.entity.Existencia e){
   int r=support.reservada(e.getId(),LocalDate.now(),LocalDate.now()); var l=lr.findByExistenciaId(e.getId()).orElse(null); Integer min=l==null?null:l.getMinimo(), max=l==null?null:l.getMaximo();
   String nivel=l==null?"SIN_CONFIGURAR":e.getExistenciaFisica()<=min?"BAJO_MINIMO":e.getExistenciaFisica()>=max?"SOBRE_MAXIMO":"EN_RANGO";
   return new ExistenciaResponse(e.getId(),e.getAlmacen().getId(),e.getAlmacen().getNombre(),e.getIdProductoExterno(),e.getExistenciaFisica(),r,Math.max(0,e.getExistenciaFisica()-r),min,max,nivel,e.getActualizadoEn(),e.getVersion());
 }
 @Override @Transactional(readOnly=true) public PageResponse<ExistenciaResponse> buscar(Long almacen, Pageable p){ return PageResponse.from(er.findAllByAlmacenId(almacen,p).map(this::map)); }
 @Override @Transactional(readOnly=true) public ExistenciaDetalleResponse detalleProducto(Long producto, Long almacen){ var e=support.existencia(almacen,producto); var movimientos=mr.findTop10ByExistenciaIdOrderByFechaHoraDesc(e.getId()).stream().map(InventarioMapper::movimiento).toList();
   var reservas=rr.findOverlapping(InventorySupport.VIGENTES,LocalDate.now(),LocalDate.now()).stream().filter(r->r.getDetalles().stream().anyMatch(d->d.getExistencia().getId().equals(e.getId()))).map(r->reservaQuery.obtenerPorOrden(r.getIdOrdenExterno())).toList(); return new ExistenciaDetalleResponse(map(e),reservas,movimientos); }
}
