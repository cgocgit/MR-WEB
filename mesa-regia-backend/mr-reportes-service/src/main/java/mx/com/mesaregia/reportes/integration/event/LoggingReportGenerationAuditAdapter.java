package mx.com.mesaregia.reportes.integration.event;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.integration.client.InternalRestClientFactory;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import org.slf4j.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class LoggingReportGenerationAuditAdapter implements ReportGenerationAuditPort {
  private static final Logger log = LoggerFactory.getLogger(LoggingReportGenerationAuditAdapter.class);
  private final RestClient security;

  public LoggingReportGenerationAuditAdapter(InternalRestClientFactory f) {
    security = f.create(System.getenv().getOrDefault("MR_SEGURIDAD_BASE_URL", "http://localhost:8081"));
  }

  @Override
  public void registrar(ReporteResultado r, FormatoExportacion formato) {
    String detalle = "filas=" + r.filas().size() + "; fechaCorte=" + r.fechaCorte() + "; filtros="
        + r.criterios().filtros().keySet();
    log.info("reporte_generado tipo={} formato={} {}", r.tipo(), formato == null ? "VISTA" : formato, detalle);
    try {
      security.post().uri("/internal/v1/auditoria")
          .body(new Req("REPORTES", "REPORTE_GENERADO", r.tipo().name(), r.tipo().name(),
              formato == null ? "VISTA" : formato.name(), detalle, MDC.get("correlationId")))
          .retrieve().toBodilessEntity();
    } catch (RuntimeException ex) {
      log.warn("No fue posible persistir auditoría distribuida de reporte: {}", ex.getMessage());
    }
  }

  private record Req(String modulo, String accion, String tipoRecurso, String identificadorRecurso, String motivo,
      String detalle, String correlationId) {
  }
}
