package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record CorteConteoItemRequest(@NotNull @Positive Long idExistencia, @NotNull @PositiveOrZero Integer cantidadFisica) {}
