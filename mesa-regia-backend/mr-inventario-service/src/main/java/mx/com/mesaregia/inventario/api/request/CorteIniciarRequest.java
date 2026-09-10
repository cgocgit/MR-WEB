package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record CorteIniciarRequest(@NotNull @Positive Long idAlmacen, @NotNull @Positive Long idUsuarioExterno, @Size(max=500) String observaciones) {}
