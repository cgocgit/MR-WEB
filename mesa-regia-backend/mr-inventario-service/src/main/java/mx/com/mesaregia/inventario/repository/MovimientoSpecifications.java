package mx.com.mesaregia.inventario.repository;

import mx.com.mesaregia.inventario.domain.entity.MovimientoInventario;
import mx.com.mesaregia.inventario.domain.enums.TipoMovimiento;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class MovimientoSpecifications {
  private MovimientoSpecifications() {
  }

  public static Specification<MovimientoInventario> filtros(
      Long producto, Long orden, TipoMovimiento tipo, LocalDateTime desde, LocalDateTime hasta) {
    return (root, query, cb) -> {
      var predicate = cb.conjunction();
      if (producto != null) {
        predicate = cb.and(predicate, cb.equal(
            root.get("existencia").get("idProductoExterno"), producto));
      }
      if (orden != null) {
        predicate = cb.and(predicate, cb.equal(root.get("idOrdenExterno"), orden));
      }
      if (tipo != null) {
        predicate = cb.and(predicate, cb.equal(root.get("tipoMovimiento"), tipo));
      }
      if (desde != null) {
        predicate = cb.and(predicate, cb.greaterThanOrEqualTo(
            root.<LocalDateTime>get("fechaHora"), desde));
      }
      if (hasta != null) {
        predicate = cb.and(predicate, cb.lessThanOrEqualTo(
            root.<LocalDateTime>get("fechaHora"), hasta));
      }
      return predicate;
    };
  }
}
