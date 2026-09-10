package mx.com.mesaregia.inventario.api.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.util.List;
public record CorteConteosRequest(@NotNull Long version, @NotEmpty List<@Valid CorteConteoItemRequest> conteos) {}
