package mx.com.mesaregia.clientes.repository;

import mx.com.mesaregia.clientes.domain.entity.ClienteProspecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ClienteProspectoRepository
    extends JpaRepository<ClienteProspecto, Long>, JpaSpecificationExecutor<ClienteProspecto> {
}
