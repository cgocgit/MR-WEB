package mx.com.mesaregia.catalogo.repository;

import jakarta.persistence.criteria.Predicate;
import mx.com.mesaregia.catalogo.domain.entity.ListaPrecio;
import mx.com.mesaregia.catalogo.domain.entity.Paquete;
import mx.com.mesaregia.catalogo.domain.entity.Producto;
import mx.com.mesaregia.catalogo.domain.entity.Servicio;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class CatalogoSpecifications {
    private CatalogoSpecifications() {
    }

    public static Specification<Producto> producto(
            String texto,
            Boolean activo,
            Long idCategoria,
            Long idTipoProducto,
            Long idColor) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (texto != null && !texto.isBlank()) {
                String pattern = "%" + texto.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("codigo")), pattern),
                        cb.like(cb.lower(root.<String>get("nombre")), pattern)));
            }
            if (activo != null) predicates.add(cb.equal(root.get("activo"), activo));
            if (idCategoria != null) predicates.add(cb.equal(root.get("categoria").get("id"), idCategoria));
            if (idTipoProducto != null) predicates.add(cb.equal(root.get("tipoProducto").get("id"), idTipoProducto));
            if (idColor != null) predicates.add(cb.equal(root.get("color").get("id"), idColor));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Servicio> servicio(String texto, Boolean activo, Long idCategoria, String tipoServicio) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (texto != null && !texto.isBlank()) {
                String pattern = "%" + texto.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("codigo")), pattern),
                        cb.like(cb.lower(root.<String>get("nombre")), pattern)));
            }
            if (activo != null) predicates.add(cb.equal(root.get("activo"), activo));
            if (idCategoria != null) predicates.add(cb.equal(root.get("categoria").get("id"), idCategoria));
            if (tipoServicio != null && !tipoServicio.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.<String>get("tipoServicio")), tipoServicio.trim().toLowerCase()));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Paquete> paquete(String texto, Boolean activo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (texto != null && !texto.isBlank()) {
                String pattern = "%" + texto.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("codigo")), pattern),
                        cb.like(cb.lower(root.<String>get("nombre")), pattern)));
            }
            if (activo != null) predicates.add(cb.equal(root.get("activo"), activo));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<ListaPrecio> listaPrecio(
            String texto,
            Boolean activo,
            LocalDate vigenteEn) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (texto != null && !texto.isBlank()) {
                String pattern = "%" + texto.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("codigo")), pattern),
                        cb.like(cb.lower(root.<String>get("nombre")), pattern)));
            }
            if (activo != null) predicates.add(cb.equal(root.get("activo"), activo));
            if (vigenteEn != null) {
                predicates.add(cb.lessThanOrEqualTo(root.<LocalDate>get("vigenciaInicio"), vigenteEn));
                predicates.add(cb.greaterThanOrEqualTo(root.<LocalDate>get("vigenciaFin"), vigenteEn));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
