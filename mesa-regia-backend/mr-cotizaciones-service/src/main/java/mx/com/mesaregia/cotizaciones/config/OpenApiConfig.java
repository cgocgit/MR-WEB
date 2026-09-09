package mx.com.mesaregia.cotizaciones.config;
import io.swagger.v3.oas.models.OpenAPI; import io.swagger.v3.oas.models.info.Info; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
@Configuration public class OpenApiConfig { @Bean OpenAPI openAPI(){return new OpenAPI().info(new Info().title("Mesa Regia - Cotizaciones API").version("v1").description("Cotizaciones, versiones, disponibilidad, envíos, seguimiento y confirmación"));} }
