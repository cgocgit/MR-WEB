package mx.com.mesaregia.cotizaciones;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.cotizaciones.api.controller.CotizacionController;
import mx.com.mesaregia.cotizaciones.api.request.CotizacionCreateRequest;
import mx.com.mesaregia.cotizaciones.application.service.*;
import mx.com.mesaregia.cotizaciones.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CotizacionController.class)
@Import(SecurityConfig.class)
class CotizacionControllerTest {
  @Autowired
  MockMvc mvc;
  @Autowired
  ObjectMapper json;
  @MockitoBean
  CotizacionQueryService q;
  @MockitoBean
  CotizacionService s;
  @MockitoBean
  CotizacionVersionService v;
  @MockitoBean
  CotizacionAvailabilityService a;
  @MockitoBean
  CotizacionDocumentService d;
  @MockitoBean
  CotizacionEnvioService e;
  @MockitoBean
  CotizacionConfirmationOrchestrator c;

  @Test
  @WithMockUser(authorities = "cotizaciones.gestionar")
  void permiteCrearConPermiso() throws Exception {
    when(s.crear(any())).thenReturn(null);
    var r = new CotizacionCreateRequest(1L, "Dirección", null, "Evento", LocalDate.now().plusDays(1),
        LocalTime.of(18, 0), new BigDecimal("50"), 1L, 1L);
    mvc.perform(post("/api/v1/cotizaciones").contentType("application/json").content(json.writeValueAsString(r)))
        .andExpect(status().isCreated());
  }
}
