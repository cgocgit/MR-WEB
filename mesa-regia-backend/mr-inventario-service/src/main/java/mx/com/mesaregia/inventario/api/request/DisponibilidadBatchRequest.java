package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.time.LocalDate; import java.util.List;
public record DisponibilidadBatchRequest(@NotNull @Positive Long idAlmacen,@NotNull LocalDate fechaInicio,@NotNull LocalDate fechaFin,
 @NotEmpty List<@Valid Item> items){ public record Item(@NotNull @Positive Long idProducto,@NotNull @Positive Integer cantidad){} }
