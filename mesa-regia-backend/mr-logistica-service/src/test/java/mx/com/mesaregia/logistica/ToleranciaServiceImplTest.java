package mx.com.mesaregia.logistica;

import mx.com.mesaregia.logistica.api.request.ToleranciaUpdateRequest;
import mx.com.mesaregia.logistica.application.service.impl.ToleranciaServiceImpl;
import mx.com.mesaregia.logistica.domain.entity.Tolerancia;
import mx.com.mesaregia.logistica.domain.enums.*;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.ToleranciaRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ToleranciaServiceImplTest {
  @Mock
  ToleranciaRepository repo;
  ToleranciaServiceImpl service;

  @BeforeEach
  void init() {
    service = new ToleranciaServiceImpl(repo, new LogisticaMapper());
  }

  @Test
  void actualizaMinutos() {
    var t = new Tolerancia();
    t.setId(1L);
    t.setCodigoEtapa(CodigoEtapa.ENTREGA);
    t.setUnidad(UnidadTolerancia.MINUTOS);
    t.setAplica(true);
    t.setActivo(true);
    t.setMinutos(30);
    t.setVersion(1L);
    when(repo.findByCodigoEtapa(CodigoEtapa.ENTREGA)).thenReturn(Optional.of(t));
    when(repo.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    var r = service.actualizar(CodigoEtapa.ENTREGA, new ToleranciaUpdateRequest(45, 1L));
    assertEquals(45, r.minutos());
  }
}
