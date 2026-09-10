package mx.com.mesaregia.ordenes.domain.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*; import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden;
@Entity @Table(name="historial_estado_orden") @Getter @Setter @NoArgsConstructor public class HistorialEstadoOrden {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_historial_estado_orden") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_orden_servicio",nullable=false) private OrdenServicio ordenServicio;
 @Enumerated(EnumType.STRING) @Column(name="estado_anterior",length=30) private EstadoOrden estadoAnterior;
 @Enumerated(EnumType.STRING) @Column(name="estado_nuevo",nullable=false,length=30) private EstadoOrden estadoNuevo;
 @Column(nullable=false,length=80) private String accion;
 @Column(length=500) private String motivo;
 @Column(name="fecha_hora",nullable=false) private LocalDateTime fechaHora;
 @Column(name="id_usuario_externo") private Long idUsuarioExterno;
 @PrePersist void pp(){if(fechaHora==null)fechaHora=LocalDateTime.now();}
}
