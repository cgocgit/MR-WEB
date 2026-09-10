package mx.com.mesaregia.cotizaciones.integration.client;

import mx.com.mesaregia.cotizaciones.integration.dto.ReservaResultado;
import java.time.*;
import java.math.BigDecimal;
import java.util.*;

public interface InventarioReservationPort {
  ReservaResultado reservar(String idempotencyKey, Long idCotizacion, Long idVersion, LocalDate fecha, LocalTime hora,
      List<Item> items);

  void vincularOrden(Long idReserva, Long idOrden, Long idUsuario);

  void liberar(Long idReserva, String motivo, Long idUsuario);

  record Item(Long idProducto, BigDecimal cantidad) {
  }
}
