package mx.com.mesaregia.clientes.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.com.mesaregia.clientes.domain.enums.Clasificacion;
import mx.com.mesaregia.clientes.domain.enums.EstadoProspecto;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cliente_prospecto")
public class ClienteProspecto {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cliente_prospecto")
  private Long id;

  @Column(nullable = false, length = 150)
  private String nombres;

  @Column(length = 150)
  private String apellidos;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Clasificacion clasificacion = Clasificacion.PROSPECTO;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_prospecto", length = 20)
  private EstadoProspecto estadoProspecto = EstadoProspecto.PENDIENTE;

  @Column(nullable = false)
  private boolean activo = true;

  @CreationTimestamp
  @Column(name = "creado_en", nullable = false, updatable = false)
  private LocalDateTime creadoEn;

  @UpdateTimestamp
  @Column(name = "actualizado_en", nullable = false)
  private LocalDateTime actualizadoEn;

  @Version
  @Column(nullable = false)
  private Long version = 1L;

  @OneToMany(mappedBy = "clienteProspecto", fetch = FetchType.LAZY)
  private List<Contacto> contactos = new ArrayList<>();

  @Column(name = "id_usuario_creacion_externo")
  private Long idUsuarioCreacionExterno;

  @Column(name = "id_usuario_modificacion_externo")
  private Long idUsuarioModificacionExterno;
}
