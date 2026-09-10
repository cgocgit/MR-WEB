package mx.com.mesaregia.pagos.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import mx.com.mesaregia.pagos.domain.enums.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_cuenta")
@Getter
@Setter
@NoArgsConstructor
public class MovimientoCuenta {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_movimiento_cuenta")
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cuenta_cobro", nullable = false)
  private CuentaCobro cuentaCobro;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_pago")
  private Pago pago;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_movimiento_origen")
  private MovimientoCuenta movimientoOrigen;
  @Column(nullable = false, length = 50, unique = true)
  private String folio;
  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_movimiento", nullable = false, length = 40)
  private TipoMovimientoCuenta tipoMovimiento;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private NaturalezaMovimiento naturaleza;
  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal monto = BigDecimal.ZERO;
  @Column(name = "operacion_externa", length = 80)
  private String operacionExterna;
  @Column(name = "referencia_externa", length = 150)
  private String referenciaExterna;
  @Column(length = 30)
  private String resultado;
  @Column(length = 1000)
  private String descripcion;
  @Column(name = "fecha_hora", nullable = false, insertable = false, updatable = false)
  private LocalDateTime fechaHora;
  @Column(name = "id_usuario_externo")
  private Long idUsuarioExterno;
  @Column(name = "clave_operacion", length = 120, unique = true)
  private String claveOperacion;
}
