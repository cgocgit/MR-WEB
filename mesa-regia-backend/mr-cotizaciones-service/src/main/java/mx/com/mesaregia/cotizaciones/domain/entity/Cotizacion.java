package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.math.BigDecimal;
import mx.com.mesaregia.cotizaciones.domain.enums.EstadoCotizacion;

@Entity
@Table(name = "cotizacion")
@Getter
@Setter
@NoArgsConstructor
public class Cotizacion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cotizacion")
  private Long id;
  @Column(nullable = false, columnDefinition = "SMALLINT UNSIGNED")
  private Integer ejercicio;
  @Column(nullable = false, columnDefinition = "INT UNSIGNED")
  private Long consecutivo;
  @Column(nullable = false, length = 40)
  private String folio;
  @Column(name = "id_cliente_prospecto_externo", nullable = false)
  private Long idClienteProspectoExterno;
  @Enumerated(EnumType.STRING)
  @Column(name = "estado_general", nullable = false, length = 30)
  private EstadoCotizacion estadoGeneral = EstadoCotizacion.BORRADOR;
  @Column(name = "id_version_elegida")
  private Long idVersionElegida;
  @Column(name = "porcentaje_confirmacion", nullable = false, precision = 5, scale = 2)
  private BigDecimal porcentajeConfirmacion;
  @Column(name = "referencia_pago_externa", length = 100)
  private String referenciaPagoExterna;
  @Column(name = "referencia_reserva_externa", length = 100)
  private String referenciaReservaExterna;
  @Column(name = "fecha_confirmacion")
  private LocalDateTime fechaConfirmacion;
  @Column(name = "creado_en", nullable = false)
  private LocalDateTime creadoEn;
  @Column(name = "actualizado_en", nullable = false)
  private LocalDateTime actualizadoEn;
  @Column(name = "id_usuario_creacion_externo")
  private Long idUsuarioCreacionExterno;
  @Column(name = "id_usuario_modificacion_externo")
  private Long idUsuarioModificacionExterno;
  @Version
  @Column(nullable = false)
  private Long version;

  @PrePersist
  void prePersist() {
    var n = LocalDateTime.now();
    creadoEn = n;
    actualizadoEn = n;
  }

  @PreUpdate
  void preUpdate() {
    actualizadoEn = LocalDateTime.now();
  }
}
