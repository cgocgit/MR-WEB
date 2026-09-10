package mx.com.mesaregia.ordenes.api.controller;

import jakarta.validation.Valid;
import mx.com.mesaregia.ordenes.api.request.*;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;
import mx.com.mesaregia.ordenes.application.service.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/ordenes")
@ConditionalOnProperty(prefix = "mesaregia.internal-endpoints", name = "enabled", havingValue = "true")
@PreAuthorize("hasAuthority('ROLE_INTERNAL_SERVICE')")
public class InternalOrdenController {
  private final OrdenCommandService cmd;
  private final OrdenStateService state;
  private final OrdenQueryService query;

  public InternalOrdenController(OrdenCommandService c, OrdenStateService s, OrdenQueryService q) {
    cmd = c;
    state = s;
    query = q;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrdenResponse crear(@RequestHeader(value = "X-Correlation-Id", required = false) String corr,
      @Valid @RequestBody OrdenCreateRequest r) {
    return cmd.generarDesdeCotizacion(r, corr);
  }

  @PostMapping("/{id}/hitos")
  public OrdenResponse hito(@PathVariable Long id,
      @RequestHeader(value = "X-Correlation-Id", required = false) String corr, @Valid @RequestBody HitoRequest r) {
    return state.aplicarHito(id, r, corr);
  }

  @GetMapping("/{id}")
  public OrdenResponse obtener(@PathVariable Long id) {
    return query.detalle(id);
  }
}
