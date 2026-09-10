package mx.com.mesaregia.cotizaciones.integration.client;

import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
import mx.com.mesaregia.cotizaciones.integration.dto.*;
import java.util.List;

public interface CatalogoPricingPort {
  void validarListaPrecio(Long idLista);

  ConceptoPrecio resolver(Long idLista, TipoConcepto tipo, Long idConcepto);

  List<PaqueteComponenteContext> componentesPaquete(Long idPaquete);
}
