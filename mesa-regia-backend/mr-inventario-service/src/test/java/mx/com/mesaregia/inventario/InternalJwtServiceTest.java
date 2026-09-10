package mx.com.mesaregia.inventario;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.inventario.security.internal.InternalJwtService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class InternalJwtServiceTest {
    @Test
    void emiteYValidaIdentidadInternaLocal() {
        var env = new MockEnvironment().withProperty("spring.application.name", "mr-inventario-service");
        var jwt = new InternalJwtService(new ObjectMapper(), env);
        String token = jwt.issue();
        assertEquals("mr-inventario-service", jwt.verifyIfInternal(token, Set.of("mr-inventario-service")).orElseThrow());
    }

    @Test
    void rechazaCallerNoAutorizado() {
        var env = new MockEnvironment().withProperty("spring.application.name", "mr-inventario-service");
        var jwt = new InternalJwtService(new ObjectMapper(), env);
        String token = jwt.issue();
        assertThrows(BadCredentialsException.class, () -> jwt.verifyIfInternal(token, Set.of("otro-service")));
    }
}
