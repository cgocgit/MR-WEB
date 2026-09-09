package mx.com.mesaregia.catalogo.api.response;

import java.util.List;

public record ListaPrecioConDetallesResponse(
        ListaPrecioResponse lista,
        List<ListaPrecioDetalleResponse> precios) {
}
