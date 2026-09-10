package mx.com.mesaregia.pagos.repository;

import mx.com.mesaregia.pagos.domain.entity.*;
import mx.com.mesaregia.pagos.domain.enums.*;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import java.time.*;
import java.util.*;

public final class MovimientoCuentaSpecifications {
  private MovimientoCuentaSpecifications() {
  }

  public static Specification<MovimientoCuenta> pagos(String folio, Integer version, String cliente, LocalDate desde,
      LocalDate hasta, MetodoPago metodo, TipoRegistroPago tipo, EstadoCuentaCobro estado, Long usuario) {
    return (root, q, cb) -> {
      List<Predicate> p = new ArrayList<>();
      var cuenta = root.join("cuentaCobro", JoinType.INNER);
      var pago = root.join("pago", JoinType.LEFT);
      p.add(root.get("tipoMovimiento").in(TipoMovimientoCuenta.PAGO, TipoMovimientoCuenta.COMPENSACION));
      if (folio != null && !folio.isBlank())
        p.add(cb.like(cb.lower(cuenta.get("folioCotizacionSnapshot")), "%" + folio.toLowerCase() + "%"));
      if (version != null)
        p.add(cb.equal(cuenta.get("numeroVersionSnapshot"), version));
      if (cliente != null && !cliente.isBlank())
        p.add(cb.like(cb.lower(cuenta.get("nombreClienteSnapshot")), "%" + cliente.toLowerCase() + "%"));
      if (desde != null)
        p.add(cb.greaterThanOrEqualTo(root.get("fechaHora"), desde.atStartOfDay()));
      if (hasta != null)
        p.add(cb.lessThan(root.get("fechaHora"), hasta.plusDays(1).atStartOfDay()));
      if (metodo != null)
        p.add(cb.equal(pago.get("metodoPago"), metodo));
      if (tipo != null)
        p.add(cb.equal(root.get("tipoMovimiento"),
            tipo == TipoRegistroPago.PAGO ? TipoMovimientoCuenta.PAGO : TipoMovimientoCuenta.COMPENSACION));
      if (estado != null)
        p.add(cb.equal(cuenta.get("estado"), estado));
      if (usuario != null)
        p.add(cb.equal(root.get("idUsuarioExterno"), usuario));
      return cb.and(p.toArray(Predicate[]::new));
    };
  }
}
