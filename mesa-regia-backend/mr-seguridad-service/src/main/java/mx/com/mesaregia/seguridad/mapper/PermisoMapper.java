package mx.com.mesaregia.seguridad.mapper;

import mx.com.mesaregia.seguridad.api.response.PermisoResponse;
import mx.com.mesaregia.seguridad.domain.entity.Permiso;
import org.springframework.stereotype.Component;

@Component
public class PermisoMapper {
  public PermisoResponse toResponse(Permiso p) {
    return new PermisoResponse(p.getId(), p.getCodigo(), p.getModulo(), p.getAccion(), p.getDescripcion(), p.isActivo(),
        p.getVersion());
  }
}
