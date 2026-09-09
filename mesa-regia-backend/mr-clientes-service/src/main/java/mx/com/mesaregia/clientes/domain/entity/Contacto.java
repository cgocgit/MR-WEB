package mx.com.mesaregia.clientes.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "contacto", uniqueConstraints = @UniqueConstraint(
        name = "uk_contacto_medio",
        columnNames = {"id_cliente_prospecto", "tipo_medio_contacto", "medio_contacto"}))
public class Contacto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contacto")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente_prospecto", nullable = false)
    private ClienteProspecto clienteProspecto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_medio_contacto", nullable = false, length = 30)
    private TipoMedioContacto tipoMedioContacto;

    @Column(name = "medio_contacto", nullable = false, length = 200)
    private String medioContacto;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal;

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
}
