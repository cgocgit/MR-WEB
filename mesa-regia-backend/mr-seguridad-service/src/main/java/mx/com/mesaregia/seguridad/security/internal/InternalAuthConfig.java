package mx.com.mesaregia.seguridad.security.internal;

import org.springframework.context.annotation.*;
import java.util.Set;

@Configuration
public class InternalAuthConfig {
  @Bean
  InternalServiceAuthenticationFilter internalServiceAuthenticationFilter(InternalJwtService jwt) {
    return new InternalServiceAuthenticationFilter(jwt, Set.of("mr-cotizaciones-service", "mr-logistica-service",
        "mr-ordenes-service", "mr-pagos-service", "mr-reportes-service"));
  }
}
