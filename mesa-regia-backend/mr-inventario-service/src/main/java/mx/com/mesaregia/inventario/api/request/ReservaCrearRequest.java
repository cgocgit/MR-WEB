package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.time.LocalDate; import java.util.List;
public record ReservaCrearRequest(@NotNull @Positive Long idOrdenExterno, @NotNull LocalDate fechaInicio, @NotNull LocalDate fechaFin,
 @NotEmpty List<@Valid ReservaDetalleRequest> detalles, @Positive Long idUsuarioExterno) {}
