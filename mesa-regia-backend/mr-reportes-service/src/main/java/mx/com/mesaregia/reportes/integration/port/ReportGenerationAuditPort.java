package mx.com.mesaregia.reportes.integration.port;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

public interface ReportGenerationAuditPort {
    void registrar(ReporteResultado resultado, FormatoExportacion formato);
}
