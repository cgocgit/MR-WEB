package mx.com.mesaregia.inventario.mapper;

import mx.com.mesaregia.inventario.api.response.*;
import mx.com.mesaregia.inventario.domain.entity.*;

public final class InventarioMapper {
  private InventarioMapper() {
  }

  public static MovimientoResponse movimiento(MovimientoInventario m) {
    return new MovimientoResponse(m.getId(), m.getFolio(), m.getExistencia().getId(),
        m.getExistencia().getIdProductoExterno(),
        m.getExistencia().getAlmacen().getId(), m.getTipoMovimiento(), m.getOrigenOperacion(), m.getCantidad(),
        m.getExistenciaAnterior(),
        m.getExistenciaResultante(), m.getIdOrdenExterno(),
        m.getCorteFisico() == null ? null : m.getCorteFisico().getId(), m.getMotivo(),
        m.getComentario(), m.getIdUsuarioExterno(), m.getFechaHora());
  }

  public static CorteDetalleResponse corteDetalle(CorteDetalle d) {
    Integer diff = d.getCantidadFisica() == null ? null : d.getCantidadFisica() - d.getCantidadRegistrada();
    return new CorteDetalleResponse(d.getId(), d.getExistencia().getId(), d.getExistencia().getIdProductoExterno(),
        d.getCantidadRegistrada(), d.getCantidadFisica(), diff);
  }

  public static CorteResponse corte(CorteFisico c) {
    return new CorteResponse(c.getId(), c.getFolio(), c.getAlmacen().getId(), c.getEstado(), c.getFechaHoraInicio(),
        c.getFechaHoraCierre(),
        c.getIdUsuarioInicioExterno(), c.getIdUsuarioCierreExterno(), c.getObservaciones(), c.getVersion(),
        c.getDetalles().stream().map(InventarioMapper::corteDetalle).toList());
  }
}
