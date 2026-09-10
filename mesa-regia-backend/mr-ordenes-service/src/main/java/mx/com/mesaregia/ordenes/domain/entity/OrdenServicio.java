package mx.com.mesaregia.ordenes.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import mx.com.mesaregia.ordenes.domain.enums.*;

@Entity
@Table(name = "orden_servicio")
@Getter
@Setter
@NoArgsConstructor
public class OrdenServicio {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_orden_servicio")
  private Long id;
  @Column(nullable = false, length = 40)
  private String folio;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EstadoOrden estado = EstadoOrden.EN_REVISION_VENTAS;
  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_compromiso", nullable = false, length = 20)
  private TipoCompromiso tipoCompromiso;
  @Column(name = "id_cotizacion_externo", nullable = false)
  private Long idCotizacionExterno;
  @Column(name = "id_cotizacion_version_externo", nullable = false)
  private Long idCotizacionVersionExterno;
  @Column(name = "id_cliente_prospecto_externo", nullable = false)
  private Long idClienteProspectoExterno;
  @Column(name = "cliente_snapshot", nullable = false, length = 300)
  private String clienteSnapshot;
  @Column(name = "contacto_snapshot", length = 250)
  private String contactoSnapshot;
  @Column(name = "evento_snapshot", nullable = false, length = 200)
  private String eventoSnapshot;
  @Column(name = "fecha_hora_evento_snapshot", nullable = false)
  private LocalDateTime fechaHoraEventoSnapshot;
  @Column(name = "domicilio_evento_snapshot", nullable = false, length = 500)
  private String domicilioEventoSnapshot;
  @Column(length = 1000)
  private String observaciones;
  @Column(name = "referencia_pago_externa", length = 100)
  private String referenciaPagoExterna;
  @Column(name = "referencia_reserva_externa", length = 100)
  private String referenciaReservaExterna;
  @Column(name = "fecha_generacion", nullable = false)
  private LocalDateTime fechaGeneracion;
  @Column(name = "actualizado_en", nullable = false)
  private LocalDateTime actualizadoEn;
  @Version
  @Column(nullable = false)
  private Long version;

  @PrePersist
  void pp() {
    var n = LocalDateTime.now();
    if (fechaGeneracion == null)
      fechaGeneracion = n;
    actualizadoEn = n;
  }

  @PreUpdate
  void pu() {
    actualizadoEn = LocalDateTime.now();
  }
}
