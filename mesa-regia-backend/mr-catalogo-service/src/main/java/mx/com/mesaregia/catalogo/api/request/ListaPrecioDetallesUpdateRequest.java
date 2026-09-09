package mx.com.mesaregia.catalogo.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public record ListaPrecioDetallesUpdateRequest(
        @NotNull @PositiveOrZero Long version,
        @NotNull @Valid List<ListaPrecioDetalleItemRequest> precios) {
}
