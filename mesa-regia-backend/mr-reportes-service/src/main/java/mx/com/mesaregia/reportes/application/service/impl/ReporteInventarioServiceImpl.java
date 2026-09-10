package mx.com.mesaregia.reportes.application.service.impl;

import mx.com.mesaregia.reportes.application.service.ReporteInventarioService;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.integration.port.InventarioReportSourcePort;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import org.springframework.stereotype.Service;

@Service
public class ReporteInventarioServiceImpl implements ReporteInventarioService {
  private final InventarioReportSourcePort source;
  private final ReporteComposer composer;
  private final ReportGenerationAuditPort audit;

  public ReporteInventarioServiceImpl(InventarioReportSourcePort source, ReporteComposer composer,
      ReportGenerationAuditPort audit) {
    this.source = source;
    this.composer = composer;
    this.audit = audit;
  }

  @Override
  public ReporteResultado generar(ReporteCriterios criterios) {
    composer.validar(criterios);
    ReporteResultado result = composer.compose(TipoReporte.INVENTARIO, criterios, source.consultar(criterios));
    audit.registrar(result, null);
    return result;
  }
}
