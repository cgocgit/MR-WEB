package mx.com.mesaregia.seguridad.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mx.com.mesaregia.seguridad.domain.enums.ResultadoAuditoria;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "evento_auditoria")
public class EventoAuditoria {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_evento_auditoria")
  private Long id;
  @Column(name = "fecha_hora", nullable = false, insertable = false, updatable = false)
  private LocalDateTime fechaHora;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_usuario")
  private Usuario usuario;
  @Column(nullable = false, length = 80)
  private String modulo;
  @Column(nullable = false, length = 100)
  private String accion;
  @Column(name = "tipo_recurso", length = 100)
  private String tipoRecurso;
  @Column(name = "identificador_recurso", length = 150)
  private String identificadorRecurso;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private ResultadoAuditoria resultado;
  @Column(length = 500)
  private String motivo;
  @Lob
  @Column(name = "valor_anterior", columnDefinition = "LONGTEXT")
  private String valorAnterior;
  @Lob
  @Column(name = "valor_nuevo", columnDefinition = "LONGTEXT")
  private String valorNuevo;
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String detalle;
  @Column(name = "id_correlacion", length = 100)
  private String idCorrelacion;
}
