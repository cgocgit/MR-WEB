package mx.com.mesaregia.logistica.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion; import java.time.LocalDateTime;
@Entity @Table(name="programacion_logistica") @Getter @Setter @NoArgsConstructor public class ProgramacionLogistica {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_programacion_logistica") private Long id;
 @Column(name="fecha_hora_preparacion",nullable=false) private LocalDateTime fechaHoraPreparacion;
 @Column(name="id_supervisor_externo",nullable=false) private Long idSupervisorExterno; @Column(name="id_representante_externo") private Long idRepresentanteExterno; @Column(name="id_chofer_externo") private Long idChoferExterno;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="id_vehiculo") private Vehiculo vehiculo;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private EstadoProgramacion estado=EstadoProgramacion.PROGRAMADA;
 @Column(name="motivo_reprogramacion",length=500) private String motivoReprogramacion; @Column(name="creado_en",nullable=false) private LocalDateTime creadoEn; @Column(name="actualizado_en",nullable=false) private LocalDateTime actualizadoEn; @Version @Column(nullable=false) private Long version;
 @PrePersist void preP(){var n=LocalDateTime.now();creadoEn=n;actualizadoEn=n;} @PreUpdate void preU(){actualizadoEn=LocalDateTime.now();}
}
