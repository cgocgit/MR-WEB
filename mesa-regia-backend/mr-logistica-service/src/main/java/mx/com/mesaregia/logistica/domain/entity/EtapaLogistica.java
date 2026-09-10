package mx.com.mesaregia.logistica.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "etapa_logistica")
@Getter
@Setter
@NoArgsConstructor
public class EtapaLogistica {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_etapa_logistica")
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_programacion_logistica", nullable = false)
  private ProgramacionLogistica programacion;
  @Enumerated(EnumType.STRING)
  @Column(name = "codigo_etapa", nullable = false, length = 40)
  private CodigoEtapa codigoEtapa;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EstadoEtapa estado = EstadoEtapa.PENDIENTE;
  @Column(name = "orden_etapa", nullable = false, columnDefinition = "SMALLINT UNSIGNED")
  private Integer ordenEtapa;
  @Column(name = "tolerancia_aplicada_minutos", columnDefinition = "SMALLINT UNSIGNED")
  private Integer toleranciaAplicadaMinutos;
  @Column(name = "duracion_prevista_minutos", columnDefinition = "SMALLINT UNSIGNED")
  private Integer duracionPrevistaMinutos;
  @Column(name = "fecha_hora_inicio")
  private LocalDateTime fechaHoraInicio;
  @Column(name = "fecha_hora_termino")
  private LocalDateTime fechaHoraTermino;
  @Column(name = "id_responsable_externo")
  private Long idResponsableExterno;
  @Column(name = "cantidad_prevista", columnDefinition = "INT UNSIGNED")
  private Integer cantidadPrevista;
  @Column(name = "cantidad_atendida", columnDefinition = "INT UNSIGNED")
  private Integer cantidadAtendida;
  @Column(length = 1000)
  private String comentario;
  @Column(name = "evidencia_1_referencia", length = 500)
  private String evidencia1Referencia;
  @Column(name = "evidencia_2_referencia", length = 500)
  private String evidencia2Referencia;
  @Column(name = "evidencia_3_referencia", length = 500)
  private String evidencia3Referencia;
  @Column(nullable = false)
  private boolean confirmada = false;
  @Version
  @Column(nullable = false)
  private Long version;
}
