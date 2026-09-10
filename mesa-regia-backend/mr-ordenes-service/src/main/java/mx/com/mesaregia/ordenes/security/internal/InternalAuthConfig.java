package mx.com.mesaregia.ordenes.security.internal;

import org.springframework.context.annotation.*;
import java.util.Set;

@Configuration
public class InternalAuthConfig {
  @Bean
  InternalServiceAuthenticationFilter internalServiceAuthenticationFilter(InternalJwtService jwt) {
    return new InternalServiceAuthenticationFilter(jwt,
        Set.of("mr-cotizaciones-service", "mr-inventario-service", "mr-logistica-service"));
  }
}
