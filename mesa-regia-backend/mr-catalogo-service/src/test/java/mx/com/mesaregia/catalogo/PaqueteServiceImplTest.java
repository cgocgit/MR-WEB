package mx.com.mesaregia.catalogo;

import jakarta.persistence.EntityManager;
import mx.com.mesaregia.catalogo.api.request.PaqueteComponenteRequest;
import mx.com.mesaregia.catalogo.api.request.PaqueteCreateRequest;
import mx.com.mesaregia.catalogo.application.service.impl.PaqueteServiceImpl;
import mx.com.mesaregia.catalogo.domain.enums.TipoComponente;
import mx.com.mesaregia.catalogo.exception.BusinessRuleException;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class PaqueteServiceImplTest {

    @Test
    void rechazaComponentesDuplicados() {
        PaqueteServiceImpl service = new PaqueteServiceImpl(
                mock(PaqueteRepository.class),
                mock(PaqueteDetalleRepository.class),
                mock(ProductoRepository.class),
                mock(ServicioRepository.class),
                mock(CatalogoMapper.class),
                mock(DomainEventPublisher.class),
                mock(EntityManager.class));

        var item = new PaqueteComponenteRequest(TipoComponente.PRODUCTO, 1L, BigDecimal.ONE, 1);
        var request = new PaqueteCreateRequest("P-1", "Paquete", null, false, List.of(item, item));

        assertThrows(BusinessRuleException.class, () -> service.registrar(request));
    }
}
