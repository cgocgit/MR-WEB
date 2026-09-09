package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Table(name="reserva_detalle", uniqueConstraints=@UniqueConstraint(name="uk_reserva_detalle", columnNames={"id_reserva","id_existencia"}))
@Getter @Setter @NoArgsConstructor
public class ReservaDetalle {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_reserva_detalle") private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_reserva", nullable=false) private Reserva reserva;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_existencia", nullable=false) private Existencia existencia;
    @Column(name="cantidad_reservada", nullable=false, columnDefinition="INT UNSIGNED") private Integer cantidadReservada;
}
