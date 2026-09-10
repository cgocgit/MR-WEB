package mx.com.mesaregia.inventario.integration.client;

import mx.com.mesaregia.inventario.integration.dto.ProductoInventarioDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.util.Optional;

@Component
public class CatalogoProductoRestAdapter implements CatalogoProductoPort {
  private final RestClient client;

  public CatalogoProductoRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_CATALOGO_BASE_URL", "http://localhost:8082"));
  }

  @Override
  public Optional<ProductoInventarioDto> obtenerProducto(Long id) {
    try {
      var r = client.get().uri("/internal/v1/catalogo/productos/{id}", id).retrieve().body(Dto.class);
      return r == null ? Optional.empty()
          : Optional.of(new ProductoInventarioDto(id, r.codigo(), r.nombre(), r.unidadMedida(), r.activo()));
    } catch (HttpClientErrorException.NotFound e) {
      return Optional.empty();
    }
  }

  private record Dto(String codigo, String nombre, String unidadMedida, boolean activo) {
  }
}
