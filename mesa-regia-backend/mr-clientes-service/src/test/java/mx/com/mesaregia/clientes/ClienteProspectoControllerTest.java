package mx.com.mesaregia.clientes;

import mx.com.mesaregia.clientes.api.controller.ClienteProspectoController;
import mx.com.mesaregia.clientes.api.response.PageResponse;
import mx.com.mesaregia.clientes.application.service.ClienteProspectoService;
import mx.com.mesaregia.clientes.security.SecurityConfig;
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

@WebMvcTest(ClienteProspectoController.class)
@Import(SecurityConfig.class)
class ClienteProspectoControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ClienteProspectoService service;

    @Test
    @WithMockUser(authorities = "clientes.consultar")
    void permiteConsultarConPermiso() throws Exception {
        when(service.buscar(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true));
        mvc.perform(get("/api/v1/clientes-prospectos")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "catalogo.consultar")
    void rechazaConsultaSinPermiso() throws Exception {
        mvc.perform(get("/api/v1/clientes-prospectos")).andExpect(status().isForbidden());
    }
}
