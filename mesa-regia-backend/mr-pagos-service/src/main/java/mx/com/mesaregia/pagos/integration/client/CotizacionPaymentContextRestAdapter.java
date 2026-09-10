package mx.com.mesaregia.pagos.integration.client;

import mx.com.mesaregia.pagos.exception.IntegrationUnavailableException;
import mx.com.mesaregia.pagos.integration.dto.CotizacionPaymentContext;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import java.math.BigDecimal;

@Component
public class CotizacionPaymentContextRestAdapter implements CotizacionPaymentContextPort {
  private final RestClient client;

  public CotizacionPaymentContextRestAdapter(InternalRestClientFactory f) {
    client = f.create(System.getenv().getOrDefault("MR_COTIZACIONES_BASE_URL", "http://localhost:8086"));
  }

  @Override
  public CotizacionPaymentContext obtener(Long c, Long v) {
    try {
      var r = client.get().uri("/internal/v1/cotizaciones/{c}/versiones/{v}/pago-contexto", c, v).retrieve()
          .body(ContextDto.class);
      if (r == null)
        throw new IntegrationUnavailableException("Respuesta vacía de Cotizaciones");
      return new CotizacionPaymentContext(r.idCotizacion(), r.idCotizacionVersion(), r.idCliente(), r.folioCotizacion(),
          r.numeroVersion(), r.nombreCliente(), r.importeTotal(), r.porcentajeConfirmacion(), r.versionElegida());
    } catch (ResourceAccessException | HttpServerErrorException e) {
      throw new IntegrationUnavailableException("mr-cotizaciones-service no disponible");
    }
  }

  private record ContextDto(Long idCotizacion, Long idCotizacionVersion, Long idCliente, String folioCotizacion,
      Integer numeroVersion, String nombreCliente, BigDecimal importeTotal, BigDecimal porcentajeConfirmacion,
      boolean versionElegida) {
  }
}
