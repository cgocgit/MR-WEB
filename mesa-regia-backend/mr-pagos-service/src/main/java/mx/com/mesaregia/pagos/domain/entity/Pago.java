package mx.com.mesaregia.pagos.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import mx.com.mesaregia.pagos.domain.enums.MetodoPago;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "pago")
@Getter
@Setter
@NoArgsConstructor
public class Pago {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_pago")
  private Long id;
  @Column(nullable = false, length = 40, unique = true)
  private String folio;
  @Column(name = "fecha_pago", nullable = false)
  private LocalDate fechaPago;
  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal monto;
  @Enumerated(EnumType.STRING)
  @Column(name = "metodo_pago", nullable = false, length = 30)
  private MetodoPago metodoPago;
  @Column(name = "referencia_pago", length = 150)
  private String referenciaPago;
  @Column(length = 500)
  private String observaciones;
  @Column(name = "clave_operacion", nullable = false, length = 120, unique = true)
  private String claveOperacion;
  @Column(name = "id_usuario_externo", nullable = false)
  private Long idUsuarioExterno;
  @Column(name = "fecha_hora_registro", nullable = false, insertable = false, updatable = false)
  private LocalDateTime fechaHoraRegistro;
}
