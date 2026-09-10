package mx.com.mesaregia.seguridad.mapper;

import mx.com.mesaregia.seguridad.api.response.ConfiguracionResponse;
import mx.com.mesaregia.seguridad.domain.entity.ConfiguracionSistema;
import org.springframework.stereotype.Component;

@Component
public class ConfiguracionMapper {
  public ConfiguracionResponse toResponse(ConfiguracionSistema c) {
    return new ConfiguracionResponse(c.getId(), c.getClave(), c.getNombre(), c.getDescripcion(), c.getTipoDato(),
        c.getValor(), c.isActivo(), c.getVersion());
  }
}
