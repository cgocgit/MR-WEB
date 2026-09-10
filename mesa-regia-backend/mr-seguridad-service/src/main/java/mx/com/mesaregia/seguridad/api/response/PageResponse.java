package mx.com.mesaregia.seguridad.api.response;

import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(List<T> contenido, int pagina, int tamanio, long totalElementos, int totalPaginas) {
  public static <T> PageResponse<T> from(Page<T> p) {
    return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
  }
}
