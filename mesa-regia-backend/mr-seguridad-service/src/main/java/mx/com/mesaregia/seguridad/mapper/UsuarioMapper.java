package mx.com.mesaregia.seguridad.mapper;

import mx.com.mesaregia.seguridad.api.response.*;
import mx.com.mesaregia.seguridad.domain.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {
  public UsuarioResponse toResponse(Usuario u) {
    var r = u.getRol();
    return new UsuarioResponse(u.getId(), u.getNombre(), u.getIdentificador(), u.isActivo(), u.getUltimoAccesoEn(),
        u.getCreadoEn(), u.getActualizadoEn(), u.getVersion(),
        new RolResumenResponse(r.getId(), r.getCodigo(), r.getNombre(), r.isActivo(), r.getVersion()));
  }
}
