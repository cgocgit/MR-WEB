package mx.com.mesaregia.inventario.repository;

import jakarta.persistence.LockModeType;
import mx.com.mesaregia.inventario.domain.entity.Reserva;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long>, JpaSpecificationExecutor<Reserva> {

    @EntityGraph(attributePaths = {"detalles", "detalles.existencia", "detalles.existencia.almacen"})
    Optional<Reserva> findFirstByIdOrdenExternoOrderByIdDesc(Long idOrdenExterno);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"detalles", "detalles.existencia", "detalles.existencia.almacen"})
    @Query("select distinct r from Reserva r where r.idOrdenExterno = :orden order by r.id desc")
    List<Reserva> findByOrdenForUpdate(@Param("orden") Long idOrdenExterno);

    @Query("select r from Reserva r where r.estado in :estados and r.fechaInicio <= :hasta and r.fechaFin >= :desde")
    List<Reserva> findOverlapping(
            @Param("estados") Collection<EstadoReserva> estados,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);
}
