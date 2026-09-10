package mx.com.mesaregia.seguridad.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.request.*;
import mx.com.mesaregia.seguridad.api.response.*;
import mx.com.mesaregia.seguridad.application.service.PermisoService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/permisos")
@RequiredArgsConstructor
public class PermisoController {
  private final PermisoService service;

  @GetMapping
  @PreAuthorize("hasAuthority('permisos.consultar')")
  public PageResponse<PermisoResponse> buscar(@RequestParam(required = false) Boolean activo,
      @RequestParam(required = false) String modulo, @PageableDefault(size = 50, sort = "codigo") Pageable p) {
    return service.buscar(activo, modulo, p);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public PermisoResponse actualizar(@PathVariable Long id, @Valid @RequestBody PermisoUpdateRequest r) {
    return service.actualizar(id, r);
  }

  @PatchMapping("/{id}/estado")
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public PermisoResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
    return service.cambiarEstado(id, r);
  }
}
