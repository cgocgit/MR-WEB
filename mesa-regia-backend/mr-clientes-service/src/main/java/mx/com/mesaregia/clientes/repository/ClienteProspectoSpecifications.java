package mx.com.mesaregia.clientes.repository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import mx.com.mesaregia.clientes.domain.entity.ClienteProspecto;
import mx.com.mesaregia.clientes.domain.entity.Contacto;
import mx.com.mesaregia.clientes.domain.enums.Clasificacion;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import mx.com.mesaregia.clientes.domain.enums.EstadoProspecto;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ClienteProspectoSpecifications {
    private ClienteProspectoSpecifications() {}

    public static Specification<ClienteProspecto> filtro(
            String q, String contacto, EstadoClienteProspecto estado, Boolean activo) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String value = "%" + q.trim().toLowerCase() + "%";
                var nombres = cb.lower(root.<String>get("nombres"));
                var apellidos = cb.lower(cb.coalesce(root.<String>get("apellidos"), ""));
                ps.add(cb.like(cb.concat(cb.concat(nombres, " "), apellidos), value));
            }

            if (contacto != null && !contacto.isBlank()) {
                Join<ClienteProspecto, Contacto> join = root.join("contactos", JoinType.INNER);
                ps.add(cb.like(cb.lower(join.get("medioContacto")), "%" + contacto.trim().toLowerCase() + "%"));
                query.distinct(true);
            }

            if (estado != null) {
                switch (estado) {
                    case PROSPECTO -> {
                        ps.add(cb.equal(root.get("clasificacion"), Clasificacion.PROSPECTO));
                        ps.add(cb.equal(root.get("estadoProspecto"), EstadoProspecto.PENDIENTE));
                    }
                    case PROSPECTO_REVISADO -> {
                        ps.add(cb.equal(root.get("clasificacion"), Clasificacion.PROSPECTO));
                        ps.add(cb.equal(root.get("estadoProspecto"), EstadoProspecto.REVISADO));
                    }
                    case CLIENTE -> ps.add(cb.equal(root.get("clasificacion"), Clasificacion.CLIENTE));
                }
            }

            if (activo != null) {
                ps.add(cb.equal(root.get("activo"), activo));
            }
            return cb.and(ps.toArray(Predicate[]::new));
        };
    }
}
