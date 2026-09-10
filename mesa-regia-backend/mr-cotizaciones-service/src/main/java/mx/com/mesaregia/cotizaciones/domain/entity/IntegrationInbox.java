package mx.com.mesaregia.cotizaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integration_inbox")
@Getter
@Setter
@NoArgsConstructor
public class IntegrationInbox {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_inbox")
  private Long id;
  @Column(name = "event_id", nullable = false, unique = true, length = 80)
  private String eventId;
  @Column(nullable = false, length = 100)
  private String tipo;
  @Column(nullable = false, length = 80)
  private String origen;
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String payload;
  @Column(name = "recibido_en", insertable = false, updatable = false)
  private LocalDateTime recibidoEn;
}
