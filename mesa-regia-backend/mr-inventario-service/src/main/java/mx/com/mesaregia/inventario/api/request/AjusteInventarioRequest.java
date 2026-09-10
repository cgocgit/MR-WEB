package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record AjusteInventarioRequest(@NotNull @Positive Long idAlmacen, @NotNull @Positive Long idProducto,
 @NotNull @PositiveOrZero Integer cantidadFisicaCorregida, @NotBlank @Size(max=250) String motivo,
 @NotBlank @Size(max=500) String comentario, @Positive Long idCorteFisico, @NotNull @Positive Long idUsuarioExterno) {}
