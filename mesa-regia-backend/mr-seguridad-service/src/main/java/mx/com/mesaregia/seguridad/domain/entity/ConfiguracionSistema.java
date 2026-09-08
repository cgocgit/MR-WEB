package mx.com.mesaregia.seguridad.domain.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import mx.com.mesaregia.seguridad.domain.enums.TipoDatoConfiguracion;
import java.time.LocalDateTime;
@Getter @Setter @Entity @Table(name="configuracion_sistema")
public class ConfiguracionSistema {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_configuracion") private Long id;
 @Column(nullable=false,length=100,unique=true) private String clave;
 @Column(nullable=false,length=150) private String nombre;
 @Column(length=500) private String descripcion;
 @Enumerated(EnumType.STRING) @Column(name="tipo_dato",nullable=false,length=30) private TipoDatoConfiguracion tipoDato;
 @Lob @Column(columnDefinition="TEXT") private String valor;
 @Column(nullable=false) private boolean activo=true;
 @Column(name="creado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime creadoEn;
 @Column(name="actualizado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime actualizadoEn;
 @Version @Column(nullable=false) private Long version;
}
