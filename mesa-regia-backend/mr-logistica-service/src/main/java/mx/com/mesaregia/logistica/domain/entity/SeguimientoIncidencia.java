package mx.com.mesaregia.logistica.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.logistica.domain.enums.EstadoIncidencia; import java.time.LocalDateTime;
@Entity @Table(name="seguimiento_incidencia") @Getter @Setter @NoArgsConstructor public class SeguimientoIncidencia {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_seguimiento_incidencia") private Long id; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_incidencia",nullable=false) private Incidencia incidencia;
 @Enumerated(EnumType.STRING) @Column(name="estado_anterior",length=30) private EstadoIncidencia estadoAnterior; @Enumerated(EnumType.STRING) @Column(name="estado_nuevo",nullable=false,length=30) private EstadoIncidencia estadoNuevo; @Column(length=1000) private String comentario; @Column(name="id_usuario_externo",nullable=false) private Long idUsuarioExterno; @Column(name="fecha_hora",nullable=false) private LocalDateTime fechaHora;
 @PrePersist void preP(){if(fechaHora==null)fechaHora=LocalDateTime.now();}
}
