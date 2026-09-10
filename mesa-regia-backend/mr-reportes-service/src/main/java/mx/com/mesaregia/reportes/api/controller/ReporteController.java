package mx.com.mesaregia.reportes.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import mx.com.mesaregia.reportes.api.request.ReporteQueryRequest;
import mx.com.mesaregia.reportes.api.response.ReporteResponse;
import mx.com.mesaregia.reportes.application.service.*;
import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteArchivo;
import mx.com.mesaregia.reportes.mapper.ReporteMapper;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {
  private final ReporteVentasService ventas;
  private final ReporteClientesService clientes;
  private final ReporteCotizacionesService cotizaciones;
  private final ReporteInventarioService inventario;
  private final ReporteExportService export;
  private final ReporteMapper mapper;

  public ReporteController(ReporteVentasService ventas, ReporteClientesService clientes,
      ReporteCotizacionesService cotizaciones, ReporteInventarioService inventario,
      ReporteExportService export, ReporteMapper mapper) {
    this.ventas = ventas;
    this.clientes = clientes;
    this.cotizaciones = cotizaciones;
    this.inventario = inventario;
    this.export = export;
    this.mapper = mapper;
  }

  @GetMapping("/ventas")
  @PreAuthorize("hasAuthority('reportes.consultar')")
  @Operation(summary = "Generar reporte de ventas")
  public ReporteResponse ventas(@ModelAttribute ReporteQueryRequest request) {
    return mapper.toResponse(ventas.generar(request.toCriterios()));
  }

  @GetMapping("/clientes")
  @PreAuthorize("hasAuthority('reportes.consultar')")
  @Operation(summary = "Generar reporte de clientes")
  public ReporteResponse clientes(@ModelAttribute ReporteQueryRequest request) {
    return mapper.toResponse(clientes.generar(request.toCriterios()));
  }

  @GetMapping("/cotizaciones")
  @PreAuthorize("hasAuthority('reportes.consultar')")
  @Operation(summary = "Generar reporte de cotizaciones")
  public ReporteResponse cotizaciones(@ModelAttribute ReporteQueryRequest request) {
    return mapper.toResponse(cotizaciones.generar(request.toCriterios()));
  }

  @GetMapping("/inventario")
  @PreAuthorize("hasAuthority('reportes.consultar')")
  @Operation(summary = "Generar reporte de inventario")
  public ReporteResponse inventario(@ModelAttribute ReporteQueryRequest request) {
    return mapper.toResponse(inventario.generar(request.toCriterios()));
  }

  @GetMapping("/{tipo}/exportacion")
  @PreAuthorize("hasAuthority('reportes.consultar')")
  @Operation(summary = "Exportar reporte en PDF, XLSX o CSV")
  public ResponseEntity<byte[]> exportar(@PathVariable String tipo, @RequestParam String format,
      @ModelAttribute ReporteQueryRequest request) {
    ReporteArchivo archivo = export.exportar(TipoReporte.fromPath(tipo), FormatoExportacion.from(format),
        request.toCriterios());
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(archivo.mediaType()));
    headers.setContentDisposition(ContentDisposition.attachment().filename(archivo.nombreArchivo()).build());
    headers.setContentLength(archivo.contenido().length);
    return ResponseEntity.ok().headers(headers).body(archivo.contenido());
  }
}
