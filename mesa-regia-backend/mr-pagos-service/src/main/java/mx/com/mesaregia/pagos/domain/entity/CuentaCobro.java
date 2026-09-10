package mx.com.mesaregia.pagos.domain.entity;
import jakarta.persistence.*; import lombok.*; import mx.com.mesaregia.pagos.domain.enums.EstadoCuentaCobro; import java.math.BigDecimal; import java.time.LocalDateTime;
@Entity @Table(name="cuenta_cobro",uniqueConstraints=@UniqueConstraint(name="uk_cuenta_cotizacion_version",columnNames={"id_cotizacion_externo","id_cotizacion_version_externo"})) @Getter @Setter @NoArgsConstructor
public class CuentaCobro {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_cuenta_cobro") private Long id;
 @Column(name="id_cotizacion_externo",nullable=false) private Long idCotizacionExterno;
 @Column(name="id_cotizacion_version_externo",nullable=false) private Long idCotizacionVersionExterno;
 @Column(name="id_cliente_externo",nullable=false) private Long idClienteExterno;
 @Column(name="folio_cotizacion_snapshot",nullable=false,length=50) private String folioCotizacionSnapshot;
 @Column(name="numero_version_snapshot",nullable=false,columnDefinition="SMALLINT UNSIGNED") private Integer numeroVersionSnapshot;
 @Column(name="nombre_cliente_snapshot",nullable=false,length=300) private String nombreClienteSnapshot;
 @Column(name="importe_total",nullable=false,precision=14,scale=2) private BigDecimal importeTotal;
 @Column(name="porcentaje_confirmacion",nullable=false,precision=5,scale=2) private BigDecimal porcentajeConfirmacion;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private EstadoCuentaCobro estado=EstadoCuentaCobro.ABIERTA;
 @Column(name="creado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime creadoEn;
 @Column(name="actualizado_en",nullable=false,insertable=false,updatable=false) private LocalDateTime actualizadoEn;
 @Version @Column(nullable=false) private Long version;
}
