package mx.com.mesaregia.cotizaciones.application.service.impl;

import mx.com.mesaregia.cotizaciones.api.request.ConfirmacionRequest;
import mx.com.mesaregia.cotizaciones.api.response.ConfirmacionResponse;
import mx.com.mesaregia.cotizaciones.application.service.SagaConfirmacionStore;
import mx.com.mesaregia.cotizaciones.domain.entity.*;
import mx.com.mesaregia.cotizaciones.domain.enums.*;
import mx.com.mesaregia.cotizaciones.exception.BusinessRuleException;
import mx.com.mesaregia.cotizaciones.integration.client.*;
import mx.com.mesaregia.cotizaciones.integration.dto.*;
import mx.com.mesaregia.cotizaciones.repository.*;
import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CotizacionConfirmationOrchestratorImplTest {
  CotizacionSupport support;
  CotizacionDetalleRepository detalles;
  EventoRepository eventos;
  DomicilioRepository domicilios;
  SagaConfirmacionRepository sagas;
  SagaConfirmacionStore store;
  PagoCoveragePort pagos;
  InventarioReservationPort reservas;
  OrdenCommandPort ordenes;
  CatalogoPricingPort catalogo;
  ClienteProspectoPort clientes;
  CotizacionConfirmationOrchestratorImpl orchestrator;
  Cotizacion cotizacion;
  CotizacionVersion version;
  SagaConfirmacion saga;

  @BeforeEach
  void setup() {
    support = mock(CotizacionSupport.class);
    detalles = mock(CotizacionDetalleRepository.class);
    eventos = mock(EventoRepository.class);
    domicilios = mock(DomicilioRepository.class);
    sagas = mock(SagaConfirmacionRepository.class);
    store = mock(SagaConfirmacionStore.class);
    pagos = mock(PagoCoveragePort.class);
    reservas = mock(InventarioReservationPort.class);
    ordenes = mock(OrdenCommandPort.class);
    catalogo = mock(CatalogoPricingPort.class);
    clientes = mock(ClienteProspectoPort.class);
    orchestrator = new CotizacionConfirmationOrchestratorImpl(support, detalles, eventos, domicilios, sagas, store,
        pagos, reservas, ordenes, catalogo, clientes);

    cotizacion = new Cotizacion();
    cotizacion.setId(1L);
    cotizacion.setIdClienteProspectoExterno(20L);
    cotizacion.setIdVersionElegida(11L);
    cotizacion.setVersion(3L);
    cotizacion.setEstadoGeneral(EstadoCotizacion.EN_SEGUIMIENTO);
    version = new CotizacionVersion();
    version.setId(11L);
    version.setIdCotizacion(1L);
    version.setEstadoVersion(EstadoVersion.ENVIADA);
    version.setObservaciones("Observacion");
    saga = new SagaConfirmacion();
    saga.setId(100L);
    saga.setClaveIdempotencia("CONF-1");
    saga.setIdCotizacion(1L);
    saga.setIdVersion(11L);
    saga.setIdUsuarioExterno(7L);
    saga.setCorrelationId("corr-1");
    saga.setEstado(EstadoSagaConfirmacion.INICIADA);
    when(support.get(1L)).thenReturn(cotizacion);
    when(support.version(1L, 11L)).thenReturn(version);
    when(store.iniciar("CONF-1", 1L, 11L, 7L, "corr-1")).thenReturn(saga);

    var ev = new Evento();
    ev.setIdCotizacion(1L);
    ev.setDescripcion("Evento");
    ev.setFechaEvento(LocalDate.now().plusDays(10));
    ev.setHoraEvento(LocalTime.of(18, 0));
    when(eventos.findByIdCotizacion(1L)).thenReturn(java.util.Optional.of(ev));
    var dom = new Domicilio();
    dom.setIdCotizacion(1L);
    dom.setDireccion("Domicilio");
    when(domicilios.findByIdCotizacion(1L)).thenReturn(java.util.Optional.of(dom));
    var det = new CotizacionDetalle();
    det.setId(31L);
    det.setIdCotizacionVersion(11L);
    det.setTipoConcepto(TipoConcepto.PRODUCTO);
    det.setIdConceptoExterno(501L);
    det.setCodigoSnapshot("P501");
    det.setNombreSnapshot("Producto");
    det.setCantidad(new BigDecimal("2"));
    det.setOrden(1);
    when(detalles.findByIdCotizacionVersionOrderByOrdenAsc(11L)).thenReturn(List.of(det));
    when(clientes.obtener(20L)).thenReturn(new ClienteContext(20L, "Cliente", "8112345678", true, "CLIENTE"));
    when(pagos.consultar(1L, 11L)).thenReturn(new CoberturaPago(true, "PAG-1"));
    when(reservas.reservar(anyString(), eq(1L), eq(11L), any(), any(), anyList()))
        .thenReturn(new ReservaResultado(70L, "RES-70"));
    when(ordenes.generar(anyString(), any())).thenReturn(new OrdenResultado(80L, "OS-80"));
    when(store.pago(100L, "PAG-1")).thenAnswer(i -> {
      saga.setReferenciaPago("PAG-1");
      saga.setEstado(EstadoSagaConfirmacion.PAGO_VALIDADO);
      return saga;
    });
    when(store.reserva(eq(100L), any())).thenAnswer(i -> {
      ReservaResultado r = i.getArgument(1);
      saga.setIdReservaExterna(r.idReserva());
      saga.setReferenciaReserva(r.referenciaReserva());
      saga.setEstado(EstadoSagaConfirmacion.RESERVA_CREADA);
      return saga;
    });
    when(store.orden(eq(100L), any())).thenAnswer(i -> {
      OrdenResultado r = i.getArgument(1);
      saga.setIdOrdenExterna(r.idOrden());
      saga.setFolioOrden(r.folioOrden());
      saga.setEstado(EstadoSagaConfirmacion.ORDEN_CREADA);
      return saga;
    });
    when(store.vinculada(100L)).thenAnswer(i -> {
      saga.setEstado(EstadoSagaConfirmacion.RESERVA_VINCULADA);
      return saga;
    });
    when(store.confirmarLocal(100L, 7L))
        .thenReturn(new ConfirmacionResponse(1L, 11L, EstadoCotizacion.CONFIRMADA, "PAG-1", "RES-70", 80L, "OS-80"));
  }

  @Test
  void confirmaConReservaOrdenYVinculacion() {
    var r = orchestrator.confirmar(1L, "CONF-1", "corr-1", new ConfirmacionRequest(7L, 3L));
    assertEquals(EstadoCotizacion.CONFIRMADA, r.estado());
    verify(reservas).reservar(eq("CONF-1:reserva"), eq(1L), eq(11L), any(), any(), anyList());
    verify(ordenes).generar(eq("CONF-1:orden"), any());
    verify(reservas).vincularOrden(70L, 80L, 7L);
    verify(store).confirmarLocal(100L, 7L);
  }

  @Test
  void compensaReservaSiOrdenRechazaAntesDeCrearse() {
    when(ordenes.generar(anyString(), any())).thenThrow(new BusinessRuleException("Orden rechazada"));
    assertThrows(BusinessRuleException.class,
        () -> orchestrator.confirmar(1L, "CONF-1", "corr-1", new ConfirmacionRequest(7L, 3L)));
    verify(reservas).liberar(eq(70L), contains("Compensación Saga"), eq(7L));
    verify(store).compensada(100L);
    verify(store, never()).confirmarLocal(anyLong(), anyLong());
  }
}
