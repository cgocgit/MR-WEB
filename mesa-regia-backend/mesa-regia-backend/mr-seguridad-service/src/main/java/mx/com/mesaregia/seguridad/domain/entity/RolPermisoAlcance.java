package mx.com.mesaregia.seguridad.domain.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;
@Getter @Setter @Entity
@Table(name="rol_permiso_alcance", uniqueConstraints=@UniqueConstraint(name="uk_rol_permiso_alcance",columnNames={"id_rol","id_permiso","alcance"}))
public class RolPermisoAlcance {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_rol_permiso_alcance") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_rol",nullable=false) private Rol rol;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_permiso",nullable=false) private Permiso permiso;
 @Column(nullable=false,length=100) private String alcance="General";
 @Column(nullable=false) private boolean activo=true;
 @Column(name="creado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime creadoEn;
 @Column(name="actualizado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime actualizadoEn;
 @Version @Column(nullable=false) private Long version;
}
