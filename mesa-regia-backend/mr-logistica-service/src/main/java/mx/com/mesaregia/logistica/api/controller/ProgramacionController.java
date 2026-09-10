package mx.com.mesaregia.logistica.api.controller;

import jakarta.validation.Valid;
import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.application.service.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/logistica")
public class ProgramacionController {
  private final ProgramacionLogisticaQueryService query;
  private final ProgramacionLogisticaService cmd;
  private final AsignacionLogisticaQueryService asignadas;

  public ProgramacionController(ProgramacionLogisticaQueryService q, ProgramacionLogisticaService c,
      AsignacionLogisticaQueryService a) {
    query = q;
    cmd = c;
    asignadas = a;
  }

  @GetMapping("/programaciones")
  @PreAuthorize("hasAnyAuthority('logistica.consultar','logistica.gestionar')")
  public PageResponse<ProgramacionResponse> buscar(@RequestParam(required = false) EstadoProgramacion estado,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
      @PageableDefault(size = 20, sort = "fechaHoraPreparacion", direction = Sort.Direction.ASC) Pageable p) {
    return query.buscar(estado, desde, hasta, p);
  }

  @GetMapping("/programaciones/{id}")
  @PreAuthorize("hasAnyAuthority('logistica.consultar','logistica.gestionar')")
  public ProgramacionResponse obtener(@PathVariable Long id) {
    return query.obtener(id);
  }

  @PostMapping("/programaciones")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('logistica.gestionar')")
  public ProgramacionResponse crear(@Valid @RequestBody ProgramacionCreateRequest r) {
    return cmd.programar(r);
  }

  @PostMapping("/programaciones/{id}/reprogramar")
  @PreAuthorize("hasAuthority('logistica.gestionar')")
  public ProgramacionResponse reprogramar(@PathVariable Long id, @Valid @RequestBody ReprogramarRequest r) {
    return cmd.reprogramar(id, r);
  }

  @PutMapping("/programaciones/{id}/recursos")
  @PreAuthorize("hasAuthority('logistica.gestionar')")
  public ProgramacionResponse recursos(@PathVariable Long id, @Valid @RequestBody RecursosRequest r) {
    return cmd.asignarRecursos(id, r);
  }

  @GetMapping("/mis-operaciones")
  @PreAuthorize("hasAnyAuthority('logistica.asignadas','logistica.traslado')")
  public List<MisOperacionResponse> mis(@RequestParam Long idUsuario, @RequestParam PerfilReportante perfil) {
    return asignadas.misOperaciones(idUsuario, perfil);
  }
}
