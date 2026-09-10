package mx.com.mesaregia.ordenes.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import mx.com.mesaregia.ordenes.domain.enums.TipoConcepto;

@Entity
@Table(name = "orden_detalle")
@Getter
@Setter
@NoArgsConstructor
public class OrdenDetalle {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_orden_detalle")
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_orden_servicio", nullable = false)
  private OrdenServicio ordenServicio;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_detalle_padre")
  private OrdenDetalle detallePadre;
  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_concepto", nullable = false, length = 20)
  private TipoConcepto tipoConcepto;
  @Column(name = "id_concepto_externo", nullable = false)
  private Long idConceptoExterno;
  @Column(name = "codigo_snapshot", length = 50)
  private String codigoSnapshot;
  @Column(name = "nombre_snapshot", nullable = false, length = 200)
  private String nombreSnapshot;
  @Column(nullable = false, precision = 12, scale = 3)
  private BigDecimal cantidad;
  @Column(name = "orden", columnDefinition = "SMALLINT UNSIGNED")
  private Integer ordenVisual;
}
