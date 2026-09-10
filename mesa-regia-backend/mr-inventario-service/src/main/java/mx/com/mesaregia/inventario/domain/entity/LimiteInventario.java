package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name="limite_inventario") @Getter @Setter @NoArgsConstructor
public class LimiteInventario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_limite_inventario") private Long id;
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_existencia", nullable=false, unique=true) private Existencia existencia;
    @Column(nullable=false, columnDefinition="INT UNSIGNED") private Integer minimo;
    @Column(nullable=false, columnDefinition="INT UNSIGNED") private Integer maximo;
    @Column(name="id_usuario_modificacion_externo", nullable=false) private Long idUsuarioModificacionExterno;
    @Column(name="actualizado_en", nullable=false, insertable=false, updatable=false) private LocalDateTime actualizadoEn;
    @Version @Column(nullable=false) private Long version;
}
