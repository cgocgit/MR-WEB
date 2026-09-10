package mx.com.mesaregia.reportes.application.service.impl;

import mx.com.mesaregia.reportes.application.service.*;
import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteArchivo;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.exception.ReporteValidationException;
import mx.com.mesaregia.reportes.integration.file.ReporteFileExporter;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class ReporteExportServiceImpl implements ReporteExportService {
  private final ReporteVentasService ventas;
  private final ReporteClientesService clientes;
  private final ReporteCotizacionesService cotizaciones;
  private final ReporteInventarioService inventario;
  private final Map<FormatoExportacion, ReporteFileExporter> exporters;
  private final ReportGenerationAuditPort audit;

  public ReporteExportServiceImpl(ReporteVentasService ventas, ReporteClientesService clientes,
      ReporteCotizacionesService cotizaciones, ReporteInventarioService inventario,
      List<ReporteFileExporter> exporters, ReportGenerationAuditPort audit) {
    this.ventas = ventas;
    this.clientes = clientes;
    this.cotizaciones = cotizaciones;
    this.inventario = inventario;
    this.audit = audit;
    this.exporters = new EnumMap<>(FormatoExportacion.class);
    exporters.forEach(e -> this.exporters.put(e.formato(), e));
  }

  @Override
  public ReporteArchivo exportar(TipoReporte tipo, FormatoExportacion formato, ReporteCriterios criterios) {
    ReporteResultado resultado = switch (tipo) {
      case VENTAS -> ventas.generar(criterios);
      case CLIENTES -> clientes.generar(criterios);
      case COTIZACIONES -> cotizaciones.generar(criterios);
      case INVENTARIO -> inventario.generar(criterios);
    };
    ReporteFileExporter exporter = exporters.get(formato);
    if (exporter == null)
      throw new ReporteValidationException("Formato no disponible: " + formato);
    byte[] bytes = exporter.exportar(resultado);
    audit.registrar(resultado, formato);
    String suffix = LocalDate.now().toString();
    return new ReporteArchivo(bytes, formato.mediaType(),
        "reporte-" + tipo.path() + "-" + suffix + "." + formato.extension());
  }
}
