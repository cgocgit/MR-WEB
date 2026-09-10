package mx.com.mesaregia.seguridad.mapper;

import mx.com.mesaregia.seguridad.api.response.RolResponse;
import mx.com.mesaregia.seguridad.domain.entity.Rol;
import org.springframework.stereotype.Component;

@Component
public class RolMapper {
  public RolResponse toResponse(Rol r, long usuarios) {
    return new RolResponse(r.getId(), r.getCodigo(), r.getNombre(), r.getDescripcion(), r.isActivo(), r.getVersion(),
        usuarios);
  }
}
