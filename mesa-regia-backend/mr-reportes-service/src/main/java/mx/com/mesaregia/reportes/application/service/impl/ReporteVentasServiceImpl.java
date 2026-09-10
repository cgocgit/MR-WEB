package mx.com.mesaregia.reportes.application.service.impl;

import mx.com.mesaregia.reportes.application.service.ReporteVentasService;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.integration.port.VentasReportSourcePort;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import org.springframework.stereotype.Service;

@Service
public class ReporteVentasServiceImpl implements ReporteVentasService {
  private final VentasReportSourcePort source;
  private final ReporteComposer composer;
  private final ReportGenerationAuditPort audit;

  public ReporteVentasServiceImpl(VentasReportSourcePort source, ReporteComposer composer,
      ReportGenerationAuditPort audit) {
    this.source = source;
    this.composer = composer;
    this.audit = audit;
  }

  @Override
  public ReporteResultado generar(ReporteCriterios criterios) {
    composer.validar(criterios);
    ReporteResultado result = composer.compose(TipoReporte.VENTAS, criterios, source.consultar(criterios));
    audit.registrar(result, null);
    return result;
  }
}
