package mx.com.mesaregia.seguridad.domain.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;
@Getter @Setter @Entity @Table(name="permiso")
public class Permiso {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_permiso") private Long id;
 @Column(nullable=false,length=120,unique=true) private String codigo;
 @Column(nullable=false,length=80) private String modulo;
 @Column(nullable=false,length=100) private String accion;
 @Column(length=250) private String descripcion;
 @Column(nullable=false) private boolean activo=true;
 @Column(name="creado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime creadoEn;
 @Column(name="actualizado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime actualizadoEn;
 @Version @Column(nullable=false) private Long version;
}
