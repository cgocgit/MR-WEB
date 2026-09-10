package mx.com.mesaregia.seguridad.api.request;
import jakarta.validation.constraints.*;
public record UsuarioUpdateRequest(@NotBlank @Size(max=150) String nombre,@NotBlank @Size(max=150) String identificador,@NotNull Long version){}
