package mx.com.mesaregia.catalogo;

import jakarta.persistence.EntityManager;
import mx.com.mesaregia.catalogo.api.request.ListaPrecioCreateRequest;
import mx.com.mesaregia.catalogo.application.service.impl.ListaPrecioServiceImpl;
import mx.com.mesaregia.catalogo.exception.BusinessRuleException;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class ListaPrecioServiceImplTest {
    @Test
    void rechazaVigenciaInvertida() {
        ListaPrecioServiceImpl service = new ListaPrecioServiceImpl(
                mock(ListaPrecioRepository.class),
                mock(ListaPrecioDetalleRepository.class),
                mock(ProductoRepository.class),
                mock(PaqueteRepository.class),
                mock(CatalogoMapper.class),
                mock(DomainEventPublisher.class),
                mock(EntityManager.class));

        var request = new ListaPrecioCreateRequest(
                "LP-1", "Lista", null,
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 1),
                BigDecimal.ZERO, true);

        assertThrows(BusinessRuleException.class, () -> service.registrar(request));
    }
}
