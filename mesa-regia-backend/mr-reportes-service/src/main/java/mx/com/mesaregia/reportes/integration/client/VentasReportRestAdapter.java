package mx.com.mesaregia.reportes.integration.client;

import mx.com.mesaregia.reportes.domain.model.*;
import mx.com.mesaregia.reportes.integration.port.VentasReportSourcePort;
import org.springframework.stereotype.Component;
import java.util.*;
import static mx.com.mesaregia.reportes.integration.client.ReportAdapterSupport.*;

@Component
public class VentasReportRestAdapter implements VentasReportSourcePort {
  private final CotizacionesReportRestAdapter cot;

  public VentasReportRestAdapter(CotizacionesReportRestAdapter c) {
    cot = c;
  }

  @Override
  public FuenteReporteData consultar(ReporteCriterios criterios) {
    var rows = cot.load(criterios, "CONFIRMADA");
    return new FuenteReporteData("mr-cotizaciones-service/confirmadas",
        List.of(c("id", "ID"), c("folio", "Folio"), c("idCliente", "Cliente"), c("estado", "Estado"),
            c("fechaEvento", "Fecha evento"), c("versionElegida", "Versión elegida")),
        rows);
  }
}
