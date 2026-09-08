package mx.com.mesaregia.seguridad.api.response;
import java.time.LocalDateTime;
public record UsuarioResponse(Long id,String nombre,String identificador,boolean activo,LocalDateTime ultimoAccesoEn,LocalDateTime creadoEn,LocalDateTime actualizadoEn,Long version,RolResumenResponse rol){}
