package mx.com.mesaregia.seguridad.api.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.util.List;
public record RolPermisosUpdateRequest(@NotNull Long version,@NotNull List<@Valid RolPermisoItemRequest> permisos){}
