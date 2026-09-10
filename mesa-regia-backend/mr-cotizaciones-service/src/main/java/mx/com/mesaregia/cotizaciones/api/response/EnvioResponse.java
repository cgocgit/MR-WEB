package mx.com.mesaregia.cotizaciones.api.response;

import java.time.LocalDateTime;

public record EnvioResponse(Long id, Long idVersion, String resultado, LocalDateTime fechaHora, String referencia) {
}