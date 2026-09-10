package mx.com.mesaregia.reportes.integration.file;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.StringJoiner;

@Component
public class CsvReporteExporter implements ReporteFileExporter {
    @Override public FormatoExportacion formato() { return FormatoExportacion.CSV; }

    @Override
    public byte[] exportar(ReporteResultado reporte) {
        StringBuilder sb = new StringBuilder("\uFEFF");
        for (var row : ReporteFileSupport.rows(reporte)) {
            StringJoiner joiner = new StringJoiner(",");
            for (String cell : row) joiner.add(quote(cell));
            sb.append(joiner).append("\r\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String quote(String value) {
        String s = value == null ? "" : value;
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
