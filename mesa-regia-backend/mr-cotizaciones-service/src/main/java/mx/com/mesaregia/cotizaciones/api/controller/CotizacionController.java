package mx.com.mesaregia.cotizaciones.api.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import mx.com.mesaregia.cotizaciones.api.request.*;
import mx.com.mesaregia.cotizaciones.api.response.*;
import mx.com.mesaregia.cotizaciones.application.service.*;
import mx.com.mesaregia.cotizaciones.domain.enums.EstadoCotizacion;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/cotizaciones")
@Validated
public class CotizacionController {
  private final CotizacionQueryService q;
  private final CotizacionService s;
  private final CotizacionVersionService v;
  private final CotizacionAvailabilityService a;
  private final CotizacionDocumentService doc;
  private final CotizacionEnvioService env;
  private final CotizacionConfirmationOrchestrator conf;

  public CotizacionController(CotizacionQueryService q, CotizacionService s, CotizacionVersionService v,
      CotizacionAvailabilityService a, CotizacionDocumentService doc, CotizacionEnvioService env,
      CotizacionConfirmationOrchestrator conf) {
    this.q = q;
    this.s = s;
    this.v = v;
    this.a = a;
    this.doc = doc;
    this.env = env;
    this.conf = conf;
  }

  @GetMapping
  @PreAuthorize("hasAnyAuthority('cotizaciones.consultar','cotizaciones.gestionar')")
  public PageResponse<CotizacionListItemResponse> buscar(@RequestParam(required = false) String texto,
      @RequestParam(required = false) Long cliente, @RequestParam(required = false) EstadoCotizacion estado,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size) {
    return q.buscar(texto, cliente, estado, desde, hasta, page, size);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('cotizaciones.consultar','cotizaciones.gestionar')")
  public CotizacionResponse detalle(@PathVariable Long id) {
    return q.detalle(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public CotizacionResponse crear(@Valid @RequestBody CotizacionCreateRequest r) {
    return s.crear(r);
  }

  @PostMapping("/{id}/versiones")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public VersionResponse recotizar(@PathVariable Long id, @Valid @RequestBody RecotizarRequest r) {
    return v.recotizar(id, r);
  }

  @PutMapping("/{id}/versiones/{idVersion}")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public VersionResponse actualizar(@PathVariable Long id, @PathVariable Long idVersion,
      @Valid @RequestBody VersionUpsertRequest r) {
    return v.actualizar(id, idVersion, r);
  }

  @GetMapping("/{id}/versiones/{idVersion}/disponibilidad")
  @PreAuthorize("hasAnyAuthority('cotizaciones.consultar','cotizaciones.gestionar')")
  public DisponibilidadResponse disponibilidad(@PathVariable Long id, @PathVariable Long idVersion) {
    return a.consultar(id, idVersion);
  }

  @GetMapping(value = "/{id}/versiones/{idVersion}/documento", produces = MediaType.APPLICATION_PDF_VALUE)
  @PreAuthorize("hasAnyAuthority('cotizaciones.consultar','cotizaciones.gestionar')")
  public ResponseEntity<byte[]> pdf(@PathVariable Long id, @PathVariable Long idVersion) {
    return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=cotizacion.pdf")
        .contentType(MediaType.APPLICATION_PDF).body(doc.generarPdf(id, idVersion));
  }

  @PostMapping("/{id}/versiones/{idVersion}/envios")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public EnvioResponse enviar(@PathVariable Long id, @PathVariable Long idVersion, @Valid @RequestBody EnvioRequest r) {
    return env.registrarEnvio(id, idVersion, r);
  }

  @PostMapping("/{id}/seguimientos")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public CotizacionResponse seguimiento(@PathVariable Long id, @Valid @RequestBody SeguimientoRequest r) {
    return s.seguimiento(id, r);
  }

  @PutMapping("/{id}/version-elegida")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public CotizacionResponse elegir(@PathVariable Long id, @Valid @RequestBody SeleccionVersionRequest r) {
    return s.seleccionarVersion(id, r);
  }

  @PostMapping("/{id}/confirmar")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public ConfirmacionResponse confirmar(@PathVariable Long id, @RequestHeader("Idempotency-Key") String key,
      @RequestHeader("X-Correlation-Id") String corr, @Valid @RequestBody ConfirmacionRequest r) {
    return conf.confirmar(id, key, corr, r);
  }

  @PostMapping("/{id}/cancelar")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public CotizacionResponse cancelar(@PathVariable Long id, @Valid @RequestBody EstadoTerminalRequest r) {
    return s.cancelar(id, r);
  }

  @PostMapping("/{id}/rechazar")
  @PreAuthorize("hasAuthority('cotizaciones.gestionar')")
  public CotizacionResponse rechazar(@PathVariable Long id, @Valid @RequestBody EstadoTerminalRequest r) {
    return s.rechazar(id, r);
  }
}
