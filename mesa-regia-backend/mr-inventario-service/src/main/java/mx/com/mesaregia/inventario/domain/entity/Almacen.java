package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "almacen")
@Getter
@Setter
@NoArgsConstructor
public class Almacen {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_almacen")
  private Long id;
  @Column(nullable = false, length = 30)
  private String codigo;
  @Column(nullable = false, length = 120)
  private String nombre;
  @Column(nullable = false)
  private Boolean activo = true;
  @Column(name = "creado_en", nullable = false, insertable = false, updatable = false)
  private LocalDateTime creadoEn;
  @Column(name = "actualizado_en", nullable = false, insertable = false, updatable = false)
  private LocalDateTime actualizadoEn;
  @Version
  @Column(nullable = false)
  private Long version;
}
