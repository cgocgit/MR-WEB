package mx.com.mesaregia.pagos.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "aplicacion_pago")
@Getter
@Setter
@NoArgsConstructor
public class AplicacionPago {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_aplicacion_pago")
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_pago", nullable = false)
  private Pago pago;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cuenta_cobro", nullable = false)
  private CuentaCobro cuentaCobro;
  @Column(name = "monto_aplicado", nullable = false, precision = 14, scale = 2)
  private BigDecimal montoAplicado;
  @Column(name = "fecha_hora_aplicacion", nullable = false, insertable = false, updatable = false)
  private LocalDateTime fechaHoraAplicacion;
}
