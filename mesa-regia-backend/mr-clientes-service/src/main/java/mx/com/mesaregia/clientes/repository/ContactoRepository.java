package mx.com.mesaregia.clientes.repository;

import mx.com.mesaregia.clientes.domain.entity.Contacto;
import mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    List<Contacto> findByClienteProspectoIdOrderByEsPrincipalDescIdAsc(Long clienteId);
    Optional<Contacto> findByIdAndClienteProspectoId(Long id, Long clienteId);
    boolean existsByClienteProspectoIdAndTipoMedioContactoAndMedioContactoIgnoreCase(
            Long clienteId, TipoMedioContacto tipo, String medioContacto);
    boolean existsByClienteProspectoIdAndTipoMedioContactoAndMedioContactoIgnoreCaseAndIdNot(
            Long clienteId, TipoMedioContacto tipo, String medioContacto, Long id);
}
