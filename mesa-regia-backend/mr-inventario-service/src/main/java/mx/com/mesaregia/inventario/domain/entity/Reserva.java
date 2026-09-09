package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="reserva") @Getter @Setter @NoArgsConstructor
public class Reserva {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_reserva") private Long id;
    @Column(nullable=false, length=40, unique=true) private String folio;
    @Column(name="id_orden_externo", nullable=false) private Long idOrdenExterno;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private EstadoReserva estado;
    @Column(name="fecha_inicio", nullable=false) private LocalDate fechaInicio;
    @Column(name="fecha_fin", nullable=false) private LocalDate fechaFin;
    @Column(name="motivo_cancelacion", length=500) private String motivoCancelacion;
    @Column(name="referencia_salida", length=100) private String referenciaSalida;
    @Column(name="creado_en", nullable=false, insertable=false, updatable=false) private LocalDateTime creadoEn;
    @Column(name="actualizado_en", nullable=false, insertable=false, updatable=false) private LocalDateTime actualizadoEn;
    @Column(name="id_usuario_creacion_externo") private Long idUsuarioCreacionExterno;
    @Column(name="id_usuario_modificacion_externo") private Long idUsuarioModificacionExterno;
    @Version @Column(nullable=false) private Long version;
    @OneToMany(mappedBy="reserva", fetch=FetchType.LAZY, cascade=CascadeType.ALL, orphanRemoval=false)
    private List<ReservaDetalle> detalles = new ArrayList<>();
}
