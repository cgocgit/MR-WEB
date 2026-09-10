package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.com.mesaregia.inventario.domain.enums.EstadoCorte;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="corte_fisico") @Getter @Setter @NoArgsConstructor
public class CorteFisico {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_corte_fisico") private Long id;
    @Column(nullable=false, length=50, unique=true) private String folio;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_almacen", nullable=false) private Almacen almacen;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private EstadoCorte estado;
    @Column(name="fecha_hora_inicio", nullable=false, insertable=false, updatable=false) private LocalDateTime fechaHoraInicio;
    @Column(name="fecha_hora_cierre") private LocalDateTime fechaHoraCierre;
    @Column(name="id_usuario_inicio_externo", nullable=false) private Long idUsuarioInicioExterno;
    @Column(name="id_usuario_cierre_externo") private Long idUsuarioCierreExterno;
    @Column(length=500) private String observaciones;
    @Version @Column(nullable=false) private Long version;
    @OneToMany(mappedBy="corteFisico", fetch=FetchType.LAZY, cascade=CascadeType.ALL, orphanRemoval=false)
    private List<CorteDetalle> detalles = new ArrayList<>();
}
