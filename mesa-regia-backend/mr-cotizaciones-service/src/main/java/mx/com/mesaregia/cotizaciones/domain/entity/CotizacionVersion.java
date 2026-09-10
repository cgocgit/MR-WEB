package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import mx.com.mesaregia.cotizaciones.domain.enums.EstadoVersion;

@Entity
@Table(name = "cotizacion_version")
@Getter
@Setter
@NoArgsConstructor
public class CotizacionVersion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cotizacion_version")
  private Long id;
  @Column(name = "id_cotizacion", nullable = false)
  private Long idCotizacion;
  @Column(name = "numero_version", nullable = false, columnDefinition = "SMALLINT UNSIGNED")
  private Integer numeroVersion;
  @Column(name = "folio_version", nullable = false, length = 50)
  private String folioVersion;
  @Enumerated(EnumType.STRING)
  @Column(name = "estado_version", nullable = false, length = 20)
  private EstadoVersion estadoVersion = EstadoVersion.BORRADOR;
  @Column(name = "id_lista_precio_externo", nullable = false)
  private Long idListaPrecioExterno;
  @Column(length = 1000)
  private String observaciones;
  @Column(name = "creado_en", nullable = false)
  private LocalDateTime creadoEn;
  @Column(name = "actualizado_en", nullable = false)
  private LocalDateTime actualizadoEn;
  @Column(name = "id_usuario_creacion_externo")
  private Long idUsuarioCreacionExterno;
  @Version
  @Column(nullable = false)
  private Long version;

  @PrePersist
  void pp() {
    var n = LocalDateTime.now();
    creadoEn = n;
    actualizadoEn = n;
  }

  @PreUpdate
  void pu() {
    actualizadoEn = LocalDateTime.now();
  }
}
