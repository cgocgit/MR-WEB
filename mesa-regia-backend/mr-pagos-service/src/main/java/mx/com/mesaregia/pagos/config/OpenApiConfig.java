package mx.com.mesaregia.pagos.config;
import io.swagger.v3.oas.models.OpenAPI; import io.swagger.v3.oas.models.info.Info; import org.springframework.context.annotation.*;
@Configuration public class OpenApiConfig { @Bean OpenAPI openAPI(){return new OpenAPI().info(new Info().title("Mesa Regia - Pagos API").version("v1").description("Pagos manuales, cuentas de cobro y compensaciones"));} }
