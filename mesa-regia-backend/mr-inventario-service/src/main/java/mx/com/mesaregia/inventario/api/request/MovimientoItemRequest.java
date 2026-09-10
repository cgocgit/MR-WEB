package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record MovimientoItemRequest(@NotNull @Positive Long idAlmacen, @NotNull @Positive Long idProducto, @NotNull @Positive Integer cantidad) {}
