package mx.com.mesaregia.logistica.api.controller;

import jakarta.validation.Valid;
import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.application.service.IncidenciaService;
import mx.com.mesaregia.logistica.domain.enums.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/logistica/incidencias")
public class IncidenciaController {
  private final IncidenciaService s;

  public IncidenciaController(IncidenciaService s) {
    this.s = s;
  }

  @GetMapping
  @PreAuthorize("hasAnyAuthority('logistica.consultar','logistica.gestionar')")
  public PageResponse<IncidenciaResponse> buscar(@RequestParam(required = false) EstadoIncidencia estado,
      @RequestParam(required = false) Long idOrden, @RequestParam(required = false) Long idProgramacion,
      @PageableDefault(size = 20) Pageable p) {
    return s.buscar(estado, idOrden, idProgramacion, p);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('logistica.consultar','logistica.gestionar')")
  public IncidenciaResponse get(@PathVariable Long id) {
    return s.obtener(id);
  }

  @GetMapping("/tipos")
  @PreAuthorize("hasAnyAuthority('logistica.proceso.gestion','logistica.traslado','logistica.gestionar')")
  public List<TipoIncidenciaResponse> tipos(@RequestParam PerfilReportante perfil) {
    return s.tipos(perfil);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyAuthority('logistica.proceso.gestion','logistica.traslado')")
  public IncidenciaResponse reportar(@Valid @RequestBody IncidenciaCreateRequest r) {
    return s.reportar(r);
  }

  @PostMapping("/{id}/seguimientos")
  @PreAuthorize("hasAuthority('logistica.gestionar')")
  public IncidenciaResponse seguir(@PathVariable Long id, @Valid @RequestBody SeguimientoRequest r) {
    return s.seguir(id, r);
  }

  @PostMapping("/{id}/resolver")
  @PreAuthorize("hasAuthority('logistica.gestionar')")
  public IncidenciaResponse resolver(@PathVariable Long id, @Valid @RequestBody ResolverIncidenciaRequest r) {
    return s.resolver(id, r);
  }
}
