package mx.com.mesaregia.logistica.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tolerancia")
@Getter
@Setter
@NoArgsConstructor
public class Tolerancia {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_tolerancia")
  private Long id;
  @Enumerated(EnumType.STRING)
  @Column(name = "codigo_etapa", nullable = false, length = 40, unique = true)
  private CodigoEtapa codigoEtapa;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UnidadTolerancia unidad;
  @Column(columnDefinition = "SMALLINT UNSIGNED")
  private Integer minutos;
  @Column(nullable = false)
  private boolean aplica = true;
  @Column(nullable = false)
  private boolean activo = true;
  @Column(name = "creado_en", nullable = false)
  private LocalDateTime creadoEn;
  @Column(name = "actualizado_en", nullable = false)
  private LocalDateTime actualizadoEn;
  @Version
  @Column(nullable = false)
  private Long version;

  @PrePersist
  void preP() {
    var n = LocalDateTime.now();
    creadoEn = n;
    actualizadoEn = n;
  }

  @PreUpdate
  void preU() {
    actualizadoEn = LocalDateTime.now();
  }
}
