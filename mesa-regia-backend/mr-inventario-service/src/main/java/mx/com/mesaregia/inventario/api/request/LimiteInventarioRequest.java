package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.constraints.*;
public record LimiteInventarioRequest(@NotNull @Positive Integer minimo, @NotNull @Positive Integer maximo,
                                      @NotNull @Positive Long idUsuarioExterno, Long version) {}
