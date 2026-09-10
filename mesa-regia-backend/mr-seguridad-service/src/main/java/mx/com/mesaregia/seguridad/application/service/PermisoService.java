package mx.com.mesaregia.seguridad.application.service;
import mx.com.mesaregia.seguridad.api.request.*; import mx.com.mesaregia.seguridad.api.response.*; import org.springframework.data.domain.Pageable;
public interface PermisoService { PageResponse<PermisoResponse> buscar(Boolean activo,String modulo,Pageable pageable); PermisoResponse actualizar(Long id,PermisoUpdateRequest r); PermisoResponse cambiarEstado(Long id,EstadoRequest r); }
