package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record CorteCerrarRequest(@NotNull Long version, @NotNull @Positive Long idUsuarioExterno) {}
