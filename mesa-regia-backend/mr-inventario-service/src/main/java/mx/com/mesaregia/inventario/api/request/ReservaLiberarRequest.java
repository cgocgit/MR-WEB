package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record ReservaLiberarRequest(@Size(max=500) String motivo, boolean cancelacion, @Positive Long idUsuarioExterno) {}
