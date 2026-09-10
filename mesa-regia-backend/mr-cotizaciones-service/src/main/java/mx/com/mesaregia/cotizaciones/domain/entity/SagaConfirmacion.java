package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import mx.com.mesaregia.cotizaciones.domain.enums.EstadoSagaConfirmacion;
import java.time.LocalDateTime;

@Entity
@Table(name = "saga_confirmacion")
@Getter
@Setter
@NoArgsConstructor
public class SagaConfirmacion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_saga")
  private Long id;
  @Column(name = "clave_idempotencia", nullable = false, unique = true, length = 120)
  private String claveIdempotencia;
  @Column(name = "id_cotizacion", nullable = false)
  private Long idCotizacion;
  @Column(name = "id_version", nullable = false)
  private Long idVersion;
  @Column(name = "id_usuario_externo")
  private Long idUsuarioExterno;
  @Column(name = "correlation_id", nullable = false, length = 100)
  private String correlationId;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EstadoSagaConfirmacion estado;
  @Column(name = "referencia_pago", length = 100)
  private String referenciaPago;
  @Column(name = "id_reserva_externa")
  private Long idReservaExterna;
  @Column(name = "referencia_reserva", length = 100)
  private String referenciaReserva;
  @Column(name = "id_orden_externa")
  private Long idOrdenExterna;
  @Column(name = "folio_orden", length = 50)
  private String folioOrden;
  @Column(name = "ultimo_error", length = 1000)
  private String ultimoError;
  @Column(nullable = false)
  private Integer intentos = 0;
  @Column(name = "creado_en", insertable = false, updatable = false)
  private LocalDateTime creadoEn;
  @Column(name = "actualizado_en", insertable = false, updatable = false)
  private LocalDateTime actualizadoEn;
  @Version
  @Column(nullable = false)
  private Long version;
}
