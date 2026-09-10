package mx.com.mesaregia.catalogo;

import mx.com.mesaregia.catalogo.api.controller.ProductoController;
import mx.com.mesaregia.catalogo.api.response.PageResponse;
import mx.com.mesaregia.catalogo.application.service.ProductoService;
import mx.com.mesaregia.catalogo.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductoController.class)
@Import(SecurityConfig.class)
class ProductoControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ProductoService service;

    @Test
    @WithMockUser(authorities = "catalogo.consultar")
    void permiteConsultarConPermiso() throws Exception {
        when(service.buscar(isNull(), isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true));
        mvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "usuarios.consultar")
    void rechazaConsultaSinPermisoCatalogo() throws Exception {
        mvc.perform(get("/api/v1/productos"))
                .andExpect(status().isForbidden());
    }
}
