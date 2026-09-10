package mx.com.mesaregia.logistica.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehiculo")
@Getter
@Setter
@NoArgsConstructor
public class Vehiculo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_vehiculo")
  private Long id;
  @Column(nullable = false, length = 20, unique = true)
  private String placa;
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
