package mx.com.mesaregia.seguridad.api.request;
import jakarta.validation.constraints.*;
public record RolUpdateRequest(@NotBlank @Size(max=100) String nombre,@Size(max=250) String descripcion,@NotNull Long version){}
