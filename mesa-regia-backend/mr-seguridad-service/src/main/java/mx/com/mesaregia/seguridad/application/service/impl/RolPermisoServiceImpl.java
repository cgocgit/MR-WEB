package mx.com.mesaregia.seguridad.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.request.*;
import mx.com.mesaregia.seguridad.api.response.RolPermisoResponse;
import mx.com.mesaregia.seguridad.application.service.*;
import mx.com.mesaregia.seguridad.domain.entity.*;
import mx.com.mesaregia.seguridad.exception.*;
import mx.com.mesaregia.seguridad.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolPermisoServiceImpl implements RolPermisoService {
  private final RolRepository roles;
  private final PermisoRepository permisos;
  private final RolPermisoAlcanceRepository repo;
  private final AuditoriaService auditoria;

  @Override
  @Transactional(readOnly = true)
  public List<RolPermisoResponse> consultar(Long idRol) {
    roles.findById(idRol).orElseThrow(() -> new ResourceNotFoundException("El rol no existe"));
    return repo.findByRolIdOrderByPermisoModuloAscPermisoCodigoAsc(idRol).stream().map(this::map).toList();
  }

  @Override
  @Transactional
  public List<RolPermisoResponse> actualizar(Long idRol, RolPermisosUpdateRequest r) {
    Rol rol = roles.findById(idRol).orElseThrow(() -> new ResourceNotFoundException("El rol no existe"));
    if (!rol.getVersion().equals(r.version()))
      throw new ConflictException("El rol fue modificado por otra operación");
    Set<String> keys = new HashSet<>();
    for (var i : r.permisos())
      if (!keys.add(i.idPermiso() + "|" + i.alcance().trim().toLowerCase()))
        throw new BusinessRuleException("No se permiten permisos duplicados con el mismo alcance");
    var existentes = repo.findByRolIdOrderByPermisoModuloAscPermisoCodigoAsc(idRol);
    Map<String, RolPermisoAlcance> byKey = existentes.stream().collect(
        Collectors.toMap(x -> x.getPermiso().getId() + "|" + x.getAlcance().toLowerCase(), Function.identity()));
    existentes.forEach(x -> x.setActivo(false));
    for (var i : r.permisos()) {
      Permiso p = permisos.findById(i.idPermiso())
          .orElseThrow(() -> new ResourceNotFoundException("El permiso " + i.idPermiso() + " no existe"));
      if (!p.isActivo())
        throw new BusinessRuleException("No se puede asignar un permiso inactivo");
      String k = p.getId() + "|" + i.alcance().trim().toLowerCase();
      RolPermisoAlcance x = byKey.get(k);
      if (x == null) {
        x = new RolPermisoAlcance();
        x.setRol(rol);
        x.setPermiso(p);
        x.setAlcance(i.alcance().trim());
      }
      x.setActivo(true);
      repo.save(x);
    }
    rol.setDescripcion(rol.getDescripcion());
    auditoria.registrar("Administración", "Modificar permisos de rol", "Rol", idRol.toString(), null, null,
        r.permisos(), "Configuración rol-permiso-alcance actualizada");
    return repo.findByRolIdOrderByPermisoModuloAscPermisoCodigoAsc(idRol).stream().map(this::map).toList();
  }

  private RolPermisoResponse map(RolPermisoAlcance x) {
    var p = x.getPermiso();
    return new RolPermisoResponse(x.getId(), p.getId(), p.getCodigo(), p.getModulo(), p.getAccion(), x.getAlcance(),
        x.isActivo(), x.getVersion());
  }
}
