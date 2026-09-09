package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
public record RetornoInventarioRequest(@NotNull @Positive Long idOrdenExterno, @NotEmpty List<@Valid MovimientoItemRequest> items,
 boolean liberarReserva, @Size(max=500) String comentario, @NotNull @Positive Long idUsuarioExterno) {}
