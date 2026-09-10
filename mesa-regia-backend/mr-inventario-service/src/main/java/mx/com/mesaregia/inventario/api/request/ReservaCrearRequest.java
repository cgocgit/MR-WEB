package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.time.LocalDate; import java.util.List;
public record ReservaCrearRequest(
 @Positive Long idOrdenExterno,
 @Size(max=120) String claveConfirmacion,
 @Positive Long idCotizacionExterno,
 @Positive Long idVersionExterna,
 @NotNull LocalDate fechaInicio,@NotNull LocalDate fechaFin,
 @NotEmpty List<@Valid ReservaDetalleRequest> detalles,@Positive Long idUsuarioExterno) {}
