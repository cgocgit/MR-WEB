package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record ReservaVincularOrdenRequest(@NotNull @Positive Long idOrdenExterno,@Positive Long idUsuarioExterno) {}
