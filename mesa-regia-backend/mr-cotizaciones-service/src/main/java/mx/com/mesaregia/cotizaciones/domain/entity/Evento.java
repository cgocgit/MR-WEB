package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Table(name = "evento")
@Getter
@Setter
@NoArgsConstructor
public class Evento {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_evento")
  private Long id;
  @Column(name = "id_cotizacion", nullable = false, unique = true)
  private Long idCotizacion;
  @Column(nullable = false, length = 150)
  private String descripcion;
  @Column(name = "fecha_evento", nullable = false)
  private LocalDate fechaEvento;
  @Column(name = "hora_evento", nullable = false)
  private LocalTime horaEvento;
}
