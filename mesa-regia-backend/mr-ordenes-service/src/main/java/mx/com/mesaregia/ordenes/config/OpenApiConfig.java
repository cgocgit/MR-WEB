package mx.com.mesaregia.ordenes.config;
import io.swagger.v3.oas.models.OpenAPI; import io.swagger.v3.oas.models.info.Info; import org.springframework.context.annotation.*;
@Configuration public class OpenApiConfig { @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("Mesa Regia - Ordenes de Servicio API").version("v1").description("CU-06.01 a CU-06.10"));} }
