package mx.com.mesaregia.logistica.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.logistica.domain.enums.EstadoIncidencia; import java.time.LocalDateTime;
@Entity @Table(name="incidencia") @Getter @Setter @NoArgsConstructor public class Incidencia {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_incidencia") private Long id; @Column(nullable=false,length=50,unique=true) private String folio;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_programacion_logistica",nullable=false) private ProgramacionLogistica programacion; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="id_etapa_logistica") private EtapaLogistica etapa;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_tipo_incidencia",nullable=false) private TipoIncidencia tipo; @Column(name="id_orden_externo",nullable=false) private Long idOrdenExterno; @Column(name="id_producto_externo") private Long idProductoExterno;
 @Column(name="cantidad_afectada",columnDefinition="INT UNSIGNED") private Integer cantidadAfectada; @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private EstadoIncidencia estado=EstadoIncidencia.REPORTADA; @Column(nullable=false,length=1000) private String descripcion;
 @Column(name="id_usuario_reporta_externo",nullable=false) private Long idUsuarioReportaExterno; @Column(name="id_supervisor_externo") private Long idSupervisorExterno; @Column(length=1000) private String resolucion;
 @Column(name="fecha_hora_reporte",nullable=false) private LocalDateTime fechaHoraReporte; @Column(name="fecha_hora_resolucion") private LocalDateTime fechaHoraResolucion; @Version @Column(nullable=false) private Long version;
 @PrePersist void preP(){if(fechaHoraReporte==null)fechaHoraReporte=LocalDateTime.now();}
}
