package mx.com.mesaregia.cotizaciones.security.internal;
import org.springframework.context.annotation.*;
import java.util.Set;
@Configuration
public class InternalAuthConfig {
    @Bean InternalServiceAuthenticationFilter internalServiceAuthenticationFilter(InternalJwtService jwt) {
        return new InternalServiceAuthenticationFilter(jwt, Set.of("mr-pagos-service", "mr-reportes-service"));
    }
}
