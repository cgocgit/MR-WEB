package mx.com.mesaregia.seguridad.api.request;
import jakarta.validation.constraints.*;
public record UsuarioCreateRequest(@NotBlank @Size(max=150) String nombre,@NotBlank @Size(max=150) String identificador,@NotNull Long idRol,boolean activo){}
