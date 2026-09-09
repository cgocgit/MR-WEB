package mx.com.mesaregia.reportes.integration.event;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Component
public class LoggingReportGenerationAuditAdapter implements ReportGenerationAuditPort {
    private static final Logger log = LoggerFactory.getLogger(LoggingReportGenerationAuditAdapter.class);

    @Override
    public void registrar(ReporteResultado resultado, FormatoExportacion formato) {
        log.info("reporte_generado tipo={} formato={} filas={} fechaCorte={} filtros={} correlationId={}",
                resultado.tipo(), formato == null ? "VISTA" : formato, resultado.filas().size(), resultado.fechaCorte(),
                resultado.criterios().filtros().keySet(), MDC.get("correlationId"));
    }
}
