package mx.com.mesaregia.logistica.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.logistica.domain.enums.PerfilReportante; import java.time.LocalDateTime;
@Entity @Table(name="tipo_incidencia") @Getter @Setter @NoArgsConstructor public class TipoIncidencia {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_tipo_incidencia") private Long id; @Column(nullable=false,length=50,unique=true) private String codigo; @Column(nullable=false,length=150) private String nombre;
 @Enumerated(EnumType.STRING) @Column(name="perfil_reportante",nullable=false,length=30) private PerfilReportante perfilReportante; @Column(nullable=false) private boolean activo=true;
 @Column(name="creado_en",nullable=false) private LocalDateTime creadoEn; @Column(name="actualizado_en",nullable=false) private LocalDateTime actualizadoEn; @Version @Column(nullable=false) private Long version;
 @PrePersist void preP(){var n=LocalDateTime.now();creadoEn=n;actualizadoEn=n;} @PreUpdate void preU(){actualizadoEn=LocalDateTime.now();}
}
