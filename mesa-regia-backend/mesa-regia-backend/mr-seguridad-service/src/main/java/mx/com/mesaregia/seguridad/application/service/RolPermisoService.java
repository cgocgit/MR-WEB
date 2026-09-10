package mx.com.mesaregia.seguridad.application.service;
import mx.com.mesaregia.seguridad.api.request.RolPermisosUpdateRequest; import mx.com.mesaregia.seguridad.api.response.RolPermisoResponse; import java.util.List;
public interface RolPermisoService { List<RolPermisoResponse> consultar(Long idRol); List<RolPermisoResponse> actualizar(Long idRol,RolPermisosUpdateRequest r); }
