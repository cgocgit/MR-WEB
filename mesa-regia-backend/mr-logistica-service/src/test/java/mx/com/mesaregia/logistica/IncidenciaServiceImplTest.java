package mx.com.mesaregia.logistica;

import mx.com.mesaregia.logistica.api.request.SeguimientoRequest;
import mx.com.mesaregia.logistica.application.service.impl.IncidenciaServiceImpl;
import mx.com.mesaregia.logistica.domain.entity.Incidencia;
import mx.com.mesaregia.logistica.domain.entity.ProgramacionLogistica;
import mx.com.mesaregia.logistica.domain.entity.TipoIncidencia;
import mx.com.mesaregia.logistica.domain.enums.EstadoIncidencia;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.AsignacionLogisticaRepository;
import mx.com.mesaregia.logistica.repository.EtapaLogisticaRepository;
import mx.com.mesaregia.logistica.repository.IncidenciaRepository;
import mx.com.mesaregia.logistica.repository.ProgramacionLogisticaRepository;
import mx.com.mesaregia.logistica.repository.SeguimientoIncidenciaRepository;
import mx.com.mesaregia.logistica.repository.TipoIncidenciaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidenciaServiceImplTest {

    @Mock
    IncidenciaRepository repo;

    @Mock
    SeguimientoIncidenciaRepository seg;

    @Mock
    TipoIncidenciaRepository tipos;

    @Mock
    ProgramacionLogisticaRepository prog;

    @Mock
    AsignacionLogisticaRepository asig;

    @Mock
    EtapaLogisticaRepository etapas;

    IncidenciaServiceImpl service;

    @BeforeEach
    void init() {
        service = new IncidenciaServiceImpl(
                repo,
                seg,
                tipos,
                prog,
                asig,
                etapas,
                new LogisticaMapper()
        );
    }

    @Test
    void seguimientoPasaAEnSeguimiento() {
        var programacion = new ProgramacionLogistica();
        programacion.setId(10L);

        var tipo = new TipoIncidencia();
        tipo.setId(20L);
        tipo.setCodigo("INCIDENCIA_PRUEBA");

        var incidencia = new Incidencia();
        incidencia.setId(1L);
        incidencia.setFolio("INCMR-2026-TEST");
        incidencia.setProgramacion(programacion);
        incidencia.setTipo(tipo);
        incidencia.setEstado(EstadoIncidencia.REPORTADA);
        incidencia.setDescripcion("Incidencia de prueba");
        incidencia.setIdUsuarioReportaExterno(1L);
        incidencia.setIdOrdenExterno(100L);
        incidencia.setVersion(1L);
        incidencia.setFechaHoraReporte(LocalDateTime.now());

        when(repo.findById(1L)).thenReturn(Optional.of(incidencia));
        when(repo.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(seg.findAllByIncidenciaIdOrderByFechaHoraAsc(1L)).thenReturn(List.of());

        var response = service.seguir(
                1L,
                new SeguimientoRequest("Atención iniciada", 2L, 1L)
        );

        assertEquals(EstadoIncidencia.EN_SEGUIMIENTO, response.estado());
        assertEquals(10L, response.idProgramacion());
        assertEquals(20L, response.idTipoIncidencia());
        verify(seg).save(any());
    }
}
