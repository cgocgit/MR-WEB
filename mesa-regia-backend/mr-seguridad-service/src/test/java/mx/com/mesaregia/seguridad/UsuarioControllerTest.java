package mx.com.mesaregia.seguridad;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.seguridad.api.controller.UsuarioController;
import mx.com.mesaregia.seguridad.api.request.UsuarioCreateRequest;
import mx.com.mesaregia.seguridad.application.service.UsuarioService;
import mx.com.mesaregia.seguridad.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import(SecurityConfig.class)
class UsuarioControllerTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ObjectMapper json;

  @MockitoBean
  private UsuarioService service;

  @Test
  @WithMockUser(authorities = "usuarios.registrar")
  void permiteRegistrarConPermiso() throws Exception {
    when(service.registrar(any())).thenReturn(null);

    UsuarioCreateRequest request = new UsuarioCreateRequest(
        "Usuario",
        "usuario",
        1L,
        true);

    mvc.perform(
        post("/api/v1/usuarios")
            .contentType("application/json")
            .content(json.writeValueAsString(request)))
        .andExpect(status().isCreated());
  }
}