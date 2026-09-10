package mx.com.mesaregia.reportes;

import mx.com.mesaregia.reportes.api.controller.ReporteController;
import mx.com.mesaregia.reportes.application.service.*;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.mapper.ReporteMapper;
import mx.com.mesaregia.reportes.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReporteController.class)
@Import({SecurityConfig.class, ReporteMapper.class})
class ReporteControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ReporteVentasService ventas;
    @MockitoBean ReporteClientesService clientes;
    @MockitoBean ReporteCotizacionesService cotizaciones;
    @MockitoBean ReporteInventarioService inventario;
    @MockitoBean ReporteExportService export;

    @Test
    @WithMockUser(authorities = "reportes.consultar")
    void permiteConsultarVentasConPermisoReal() throws Exception {
        when(ventas.generar(any())).thenReturn(new ReporteResultado(TipoReporte.VENTAS, OffsetDateTime.now(), new ReporteCriterios(null, null, Map.of()), "Ventas", List.of(), List.of()));
        mvc.perform(get("/api/v1/reportes/ventas")).andExpect(status().isOk());
    }
}
