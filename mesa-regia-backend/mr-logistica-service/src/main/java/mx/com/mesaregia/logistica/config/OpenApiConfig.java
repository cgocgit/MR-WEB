package mx.com.mesaregia.logistica.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI api(@Value("${spring.application.name}") String n) {
    return new OpenAPI().info(new Info().title(n).version("v1").description("API de Logística de Mesa Regia"));
  }
}
