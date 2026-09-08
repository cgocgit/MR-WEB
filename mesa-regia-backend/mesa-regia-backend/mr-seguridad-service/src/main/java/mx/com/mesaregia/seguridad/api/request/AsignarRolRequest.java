package mx.com.mesaregia.seguridad.api.request;
import jakarta.validation.constraints.*;
public record AsignarRolRequest(@NotNull Long idRol,@NotNull Long version,@NotBlank @Size(max=500) String motivo){}
