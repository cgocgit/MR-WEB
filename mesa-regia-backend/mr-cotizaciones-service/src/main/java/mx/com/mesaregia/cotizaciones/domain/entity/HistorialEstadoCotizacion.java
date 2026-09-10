package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Table(name = "historial_estado_cotizacion")
@Getter
@Setter
@NoArgsConstructor
public class HistorialEstadoCotizacion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_historial_estado_cotizacion")
  private Long id;
  @Column(name = "id_cotizacion", nullable = false)
  private Long idCotizacion;
  @Column(name = "id_cotizacion_version")
  private Long idCotizacionVersion;
  @Column(nullable = false, length = 60)
  private String evento;
  @Column(name = "estado_anterior", length = 30)
  private String estadoAnterior;
  @Column(name = "estado_nuevo", length = 30)
  private String estadoNuevo;
  @Column(length = 500)
  private String motivo;
  @Column(name = "fecha_hora", nullable = false)
  private LocalDateTime fechaHora;
  @Column(name = "id_usuario_externo")
  private Long idUsuarioExterno;

  @PrePersist
  void pp() {
    if (fechaHora == null)
      fechaHora = LocalDateTime.now();
  }
}
