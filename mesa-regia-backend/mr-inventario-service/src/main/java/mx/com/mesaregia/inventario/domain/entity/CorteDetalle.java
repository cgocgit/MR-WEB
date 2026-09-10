package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "corte_detalle", uniqueConstraints = @UniqueConstraint(name = "uk_corte_detalle", columnNames = {
    "id_corte_fisico", "id_existencia" }))
@Getter
@Setter
@NoArgsConstructor
public class CorteDetalle {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_corte_detalle")
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_corte_fisico", nullable = false)
  private CorteFisico corteFisico;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_existencia", nullable = false)
  private Existencia existencia;
  @Column(name = "cantidad_registrada", nullable = false, columnDefinition = "INT UNSIGNED")
  private Integer cantidadRegistrada;
  @Column(name = "cantidad_fisica", columnDefinition = "INT UNSIGNED")
  private Integer cantidadFisica;
}
