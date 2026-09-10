package mx.com.mesaregia.seguridad.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.request.*;
import mx.com.mesaregia.seguridad.api.response.*;
import mx.com.mesaregia.seguridad.application.service.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RolController {
  private final RolService roles;
  private final RolPermisoService rolPermiso;

  @GetMapping
  @PreAuthorize("hasAuthority('roles.consultar')")
  @Operation(summary = "Consultar roles")
  public List<RolResponse> buscar(@RequestParam(required = false) Boolean activo) {
    return roles.buscar(activo);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('roles.consultar')")
  public RolResponse obtener(@PathVariable Long id) {
    return roles.obtener(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public RolResponse registrar(@Valid @RequestBody RolCreateRequest r) {
    return roles.registrar(r);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public RolResponse actualizar(@PathVariable Long id, @Valid @RequestBody RolUpdateRequest r) {
    return roles.actualizar(id, r);
  }

  @PatchMapping("/{id}/estado")
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public RolResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
    return roles.cambiarEstado(id, r);
  }

  @GetMapping("/{id}/permisos")
  @PreAuthorize("hasAuthority('permisos.consultar')")
  public List<RolPermisoResponse> permisos(@PathVariable Long id) {
    return rolPermiso.consultar(id);
  }

  @PutMapping("/{id}/permisos")
  @PreAuthorize("hasAuthority('permisos.modificar')")
  public List<RolPermisoResponse> actualizarPermisos(@PathVariable Long id,
      @Valid @RequestBody RolPermisosUpdateRequest r) {
    return rolPermiso.actualizar(id, r);
  }
}
