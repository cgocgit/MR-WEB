package mx.com.mesaregia.inventario.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name="existencia", uniqueConstraints=@UniqueConstraint(name="uk_existencia_almacen_producto", columnNames={"id_almacen","id_producto_externo"}))
@Getter @Setter @NoArgsConstructor
public class Existencia {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_existencia") private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="id_almacen", nullable=false) private Almacen almacen;
    @Column(name="id_producto_externo", nullable=false) private Long idProductoExterno;
    @Column(name="existencia_fisica", nullable=false, columnDefinition="INT UNSIGNED") private Integer existenciaFisica = 0;
    @Column(name="actualizado_en", nullable=false, insertable=false, updatable=false) private LocalDateTime actualizadoEn;
    @Version @Column(nullable=false) private Long version;
}
