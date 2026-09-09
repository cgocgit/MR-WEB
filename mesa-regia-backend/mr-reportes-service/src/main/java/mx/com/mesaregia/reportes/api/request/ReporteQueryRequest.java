package mx.com.mesaregia.reportes.api.request;

import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.exception.ReporteValidationException;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ReporteQueryRequest {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;

    /** Filtros genéricos repetibles en forma clave=valor. */
    private List<String> filtro = List.of();

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public List<String> getFiltro() { return filtro; }
    public void setFiltro(List<String> filtro) { this.filtro = filtro == null ? List.of() : filtro; }

    public ReporteCriterios toCriterios() {
        Map<String, String> filtros = new LinkedHashMap<>();
        for (String item : filtro) {
            if (item == null || item.isBlank()) continue;
            int idx = item.indexOf('=');
            if (idx <= 0 || idx == item.length() - 1) {
                throw new ReporteValidationException("Cada filtro debe usar la forma clave=valor: " + item);
            }
            String clave = item.substring(0, idx).trim();
            String valor = item.substring(idx + 1).trim();
            if (clave.isBlank() || valor.isBlank()) throw new ReporteValidationException("Filtro inválido: " + item);
            filtros.put(clave, valor);
        }
        return new ReporteCriterios(fechaInicio, fechaFin, filtros);
    }
}
