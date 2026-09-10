package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.OrdenInventarioDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.util.*;

@Component
public class OrdenInventarioRestAdapter implements OrdenInventarioPort {
  private final RestClient client;

  public OrdenInventarioRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_ORDENES_BASE_URL", "http://localhost:8087"));
  }

  @Override
  public Optional<OrdenInventarioDto> obtenerOrden(Long id) {
    try {
      var r = client.get().uri("/internal/v1/ordenes/{id}", id).retrieve().body(Dto.class);
      if (r == null)
        return Optional.empty();
      Set<Long> ids = new HashSet<>();
      if (r.detalles() != null)
        r.detalles().stream().filter(d -> "PRODUCTO".equals(d.tipoConcepto()))
            .forEach(d -> ids.add(d.idConceptoExterno()));
      return Optional.of(new OrdenInventarioDto(r.id(), r.folio(), r.estado(), ids));
    } catch (HttpClientErrorException.NotFound e) {
      return Optional.empty();
    }
  }

  private record Dto(Long id, String folio, String estado, List<Detalle> detalles) {
  }

  private record Detalle(String tipoConcepto, Long idConceptoExterno) {
  }
}
