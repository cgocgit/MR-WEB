package mx.com.mesaregia.seguridad.domain.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.LocalDateTime;
@Getter @Setter @Entity @Table(name="usuario")
public class Usuario {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_usuario") private Long id;
 @Column(nullable=false,length=150) private String nombre;
 @Column(nullable=false,length=150,unique=true) private String identificador;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="id_rol",nullable=false) private Rol rol;
 @Column(nullable=false) private boolean activo=true;
 @Column(name="ultimo_acceso_en") private LocalDateTime ultimoAccesoEn;
 @Column(name="creado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime creadoEn;
 @Column(name="actualizado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime actualizadoEn;
 @Version @Column(nullable=false) private Long version;
}
