package mx.com.mesaregia.cotizaciones.domain.entity; import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
@Entity @Table(name="cotizacion_detalle") @Getter @Setter @NoArgsConstructor public class CotizacionDetalle {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_cotizacion_detalle") private Long id;
 @Column(name="id_cotizacion_version",nullable=false) private Long idCotizacionVersion;
 @Enumerated(EnumType.STRING) @Column(name="tipo_concepto",nullable=false,length=20) private TipoConcepto tipoConcepto;
 @Column(name="id_concepto_externo",nullable=false) private Long idConceptoExterno;
 @Column(name="codigo_snapshot",nullable=false,length=50) private String codigoSnapshot;
 @Column(name="nombre_snapshot",nullable=false,length=200) private String nombreSnapshot;
 @Column(nullable=false,precision=12,scale=3) private BigDecimal cantidad;
 @Column(name="precio_unitario_aplicado",nullable=false,precision=14,scale=2) private BigDecimal precioUnitarioAplicado;
 @Column(name="porcentaje_adicional_aplicado",precision=5,scale=2) private BigDecimal porcentajeAdicionalAplicado;
 @Column(columnDefinition="SMALLINT UNSIGNED") private Integer orden;
}
