package mx.com.mesaregia.catalogo.api.response;

import java.util.List;

public record PaqueteDetalleResponse(
        PaqueteResponse paquete,
        List<PaqueteComponenteResponse> componentes) {
}
