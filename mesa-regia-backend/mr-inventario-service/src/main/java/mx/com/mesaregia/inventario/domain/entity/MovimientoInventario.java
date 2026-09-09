package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.com.mesaregia.inventario.domain.enums.OrigenOperacion;
import mx.com.mesaregia.inventario.domain.enums.TipoMovimiento;
import java.time.LocalDateTime;

@Entity @Table(name="movimiento_inventario") @Getter @Setter @NoArgsConstructor
public class MovimientoInventario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_movimiento_inventario") private Long id;
    @Column(nullable=false, length=50, unique=true) private String folio;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_existencia", nullable=false) private Existencia existencia;
    @Enumerated(EnumType.STRING) @Column(name="tipo_movimiento", nullable=false, length=20) private TipoMovimiento tipoMovimiento;
    @Enumerated(EnumType.STRING) @Column(name="origen_operacion", nullable=false, length=30) private OrigenOperacion origenOperacion;
    @Column(nullable=false, columnDefinition="INT UNSIGNED") private Integer cantidad;
    @Column(name="existencia_anterior", nullable=false, columnDefinition="INT UNSIGNED") private Integer existenciaAnterior;
    @Column(name="existencia_resultante", nullable=false, columnDefinition="INT UNSIGNED") private Integer existenciaResultante;
    @Column(name="id_orden_externo") private Long idOrdenExterno;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="id_corte_fisico") private CorteFisico corteFisico;
    @Column(length=250) private String motivo;
    @Column(length=500) private String comentario;
    @Column(name="id_usuario_externo", nullable=false) private Long idUsuarioExterno;
    @Column(name="fecha_hora", nullable=false, insertable=false, updatable=false) private LocalDateTime fechaHora;
    @Column(name="clave_operacion", length=100, unique=true) private String claveOperacion;
}
