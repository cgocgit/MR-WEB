package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record ReservaDetalleRequest(@NotNull @Positive Long idAlmacen, @NotNull @Positive Long idProducto, @NotNull @Positive Integer cantidad) {}
