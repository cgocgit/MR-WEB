package mx.com.mesaregia.ordenes.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import mx.com.mesaregia.ordenes.api.request.*;
import mx.com.mesaregia.ordenes.api.response.*;
import mx.com.mesaregia.ordenes.application.service.*;
import mx.com.mesaregia.ordenes.domain.enums.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ordenes")
@Validated
public class OrdenController {
  private final OrdenQueryService q;
  private final OrdenService s;
  private final OrdenCancellationOrchestrator cancel;

  public OrdenController(OrdenQueryService q, OrdenService s, OrdenCancellationOrchestrator cancel) {
    this.q = q;
    this.s = s;
    this.cancel = cancel;
  }

  @GetMapping
  @PreAuthorize("hasAnyAuthority('ordenes.consultar','ordenes.revisar','ordenes.cancelar')")
  public PageResponse<OrdenListItemResponse> buscar(@RequestParam(required = false) String texto,
      @RequestParam(required = false) Long cotizacion, @RequestParam(required = false) Long cliente,
      @RequestParam(required = false) EstadoOrden estado, @RequestParam(required = false) TipoCompromiso tipo,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size) {
    return q.buscar(texto, cotizacion, cliente, estado, tipo, desde, hasta, page, size);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('ordenes.detalle.consultar','ordenes.consultar','ordenes.revisar','ordenes.cancelar')")
  public OrdenResponse detalle(@PathVariable Long id) {
    return q.detalle(id);
  }

  @PostMapping("/{id}/revision")
  @PreAuthorize("hasAuthority('ordenes.revisar')")
  public OrdenResponse revision(@PathVariable Long id, @Valid @RequestBody RevisionRequest r) {
    return s.registrarRevisionVentas(id, r);
  }

  @PostMapping("/{id}/liberar-programacion")
  @PreAuthorize("hasAuthority('ordenes.revisar')")
  public OrdenResponse liberar(@PathVariable Long id, @Valid @RequestBody LiberacionRequest r) {
    return s.liberarProgramacion(id, r);
  }

  @PostMapping("/{id}/cancelar")
  @PreAuthorize("hasAuthority('ordenes.cancelar')")
  public OrdenResponse cancelar(@PathVariable Long id,
      @RequestHeader(value = "X-Correlation-Id", required = false) String corr,
      @Valid @RequestBody CancelacionRequest r) {
    return cancel.cancelar(id, r, corr);
  }
}
