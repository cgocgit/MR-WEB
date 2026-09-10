package mx.com.mesaregia.logistica.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.logistica.domain.enums.EstadoAsignacion; import java.time.LocalDateTime;
@Entity @Table(name="asignacion_logistica") @Getter @Setter @NoArgsConstructor public class AsignacionLogistica {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_asignacion_logistica") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_programacion_logistica",nullable=false) private ProgramacionLogistica programacion;
 @Column(name="id_orden_externo",nullable=false) private Long idOrdenExterno; @Column(name="orden_parada",nullable=false,columnDefinition="SMALLINT UNSIGNED") private Integer ordenParada;
 @Column(name="fecha_hora_programada") private LocalDateTime fechaHoraProgramada; @Column(name="domicilio_snapshot",length=500) private String domicilioSnapshot;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private EstadoAsignacion estado=EstadoAsignacion.PROGRAMADA;
}
