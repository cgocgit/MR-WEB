package mx.com.mesaregia.cotizaciones.mapper;
import mx.com.mesaregia.cotizaciones.api.response.*; import mx.com.mesaregia.cotizaciones.domain.entity.*; import java.math.BigDecimal; import java.util.*;
public final class CotizacionMapper { private CotizacionMapper(){}
 public static DetalleResponse detalle(CotizacionDetalle d){BigDecimal sub=d.getPrecioUnitarioAplicado().multiply(d.getCantidad());return new DetalleResponse(d.getId(),d.getTipoConcepto(),d.getIdConceptoExterno(),d.getCodigoSnapshot(),d.getNombreSnapshot(),d.getCantidad(),d.getPrecioUnitarioAplicado(),d.getPorcentajeAdicionalAplicado(),d.getOrden(),sub);}
 public static VersionResponse version(CotizacionVersion v,List<CotizacionDetalle> ds){var det=ds.stream().map(CotizacionMapper::detalle).toList();var total=det.stream().map(DetalleResponse::subtotal).reduce(BigDecimal.ZERO,BigDecimal::add);return new VersionResponse(v.getId(),v.getNumeroVersion(),v.getFolioVersion(),v.getEstadoVersion(),v.getIdListaPrecioExterno(),v.getObservaciones(),v.getVersion(),v.getCreadoEn(),v.getActualizadoEn(),det,total);}
 public static HistorialResponse historial(HistorialEstadoCotizacion h){return new HistorialResponse(h.getId(),h.getIdCotizacionVersion(),h.getEvento(),h.getEstadoAnterior(),h.getEstadoNuevo(),h.getMotivo(),h.getFechaHora(),h.getIdUsuarioExterno());}
}
