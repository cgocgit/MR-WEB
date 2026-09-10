package mx.com.mesaregia.inventario.repository;

import mx.com.mesaregia.inventario.domain.entity.Reserva;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ReservaSpecifications {
  private ReservaSpecifications() {
  }

  public static Specification<Reserva> filtros(
      Long orden, EstadoReserva estado, LocalDate desde, LocalDate hasta) {
    return (root, query, cb) -> {
      var predicate = cb.conjunction();
      if (orden != null) {
        predicate = cb.and(predicate, cb.equal(root.get("idOrdenExterno"), orden));
      }
      if (estado != null) {
        predicate = cb.and(predicate, cb.equal(root.get("estado"), estado));
      }
      if (desde != null) {
        predicate = cb.and(predicate, cb.greaterThanOrEqualTo(
            root.<LocalDate>get("fechaFin"), desde));
      }
      if (hasta != null) {
        predicate = cb.and(predicate, cb.lessThanOrEqualTo(
            root.<LocalDate>get("fechaInicio"), hasta));
      }
      return predicate;
    };
  }
}
