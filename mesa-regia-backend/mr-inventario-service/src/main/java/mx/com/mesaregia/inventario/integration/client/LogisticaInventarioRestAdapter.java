package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.LogisticaInventarioDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.time.LocalDate;
import java.util.Optional;

@Component
public class LogisticaInventarioRestAdapter implements LogisticaInventarioPort {
  private final RestClient client;

  public LogisticaInventarioRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_LOGISTICA_BASE_URL", "http://localhost:8088"));
  }

  @Override
  public Optional<LogisticaInventarioDto> obtenerContexto(Long id) {
    try {
      var r = client.get().uri("/internal/v1/logistica/ordenes/{id}/contexto", id).retrieve().body(Dto.class);
      return r == null ? Optional.empty()
          : Optional.of(new LogisticaInventarioDto(id, r.fechaInicio(), r.fechaFin(), r.estado()));
    } catch (HttpClientErrorException.NotFound e) {
      return Optional.empty();
    }
  }

  private record Dto(LocalDate fechaInicio, LocalDate fechaFin, String estado) {
  }
}
