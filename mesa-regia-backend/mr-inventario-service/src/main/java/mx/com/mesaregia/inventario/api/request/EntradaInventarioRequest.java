package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
import mx.com.mesaregia.inventario.domain.enums.OrigenOperacion;
public record EntradaInventarioRequest(@NotNull @Positive Long idAlmacen, @NotNull @Positive Long idProducto,
 @NotNull @Positive Integer cantidad, @NotNull OrigenOperacion origenOperacion, @Positive Long idOrdenExterno,
 @Size(max=500) String comentario, @NotNull @Positive Long idUsuarioExterno) {}
