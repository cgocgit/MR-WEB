package mx.com.mesaregia.inventario.repository;

import mx.com.mesaregia.inventario.domain.entity.ReservaDetalle;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReservaDetalleRepository extends JpaRepository<ReservaDetalle, Long> {
  Optional<ReservaDetalle> findByReservaIdAndExistenciaId(Long idReserva, Long idExistencia);

  List<ReservaDetalle> findAllByReservaId(Long idReserva);

  @Query("""
      select coalesce(sum(rd.cantidadReservada),0)
      from ReservaDetalle rd
      where rd.existencia.id=:existencia
        and rd.reserva.estado in :estados
        and rd.reserva.fechaInicio<=:hasta
        and rd.reserva.fechaFin>=:desde
      """)
  Long sumReservadaEnPeriodo(@Param("existencia") Long idExistencia,
      @Param("estados") Collection<EstadoReserva> estados,
      @Param("desde") LocalDate desde,
      @Param("hasta") LocalDate hasta);
}
