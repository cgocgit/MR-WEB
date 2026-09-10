package mx.com.mesaregia.seguridad.application.service;
import mx.com.mesaregia.seguridad.api.request.*; import mx.com.mesaregia.seguridad.api.response.*; import org.springframework.data.domain.Pageable;
public interface UsuarioService { PageResponse<UsuarioResponse> buscar(String texto,Boolean activo,Long idRol,Pageable pageable); UsuarioResponse obtener(Long id); UsuarioResponse registrar(UsuarioCreateRequest r); UsuarioResponse actualizar(Long id,UsuarioUpdateRequest r); UsuarioResponse cambiarEstado(Long id,EstadoRequest r); UsuarioResponse asignarRol(Long id,AsignarRolRequest r); }
