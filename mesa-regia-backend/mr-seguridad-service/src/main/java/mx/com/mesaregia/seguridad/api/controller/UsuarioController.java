package mx.com.mesaregia.seguridad.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.request.*;
import mx.com.mesaregia.seguridad.api.response.*;
import mx.com.mesaregia.seguridad.application.service.UsuarioService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

  private final UsuarioService service;

  @GetMapping
  @PreAuthorize("hasAuthority('usuarios.consultar')")
  @Operation(summary = "Consultar usuarios")
  public PageResponse<UsuarioResponse> buscar(@RequestParam(required = false) String q,
      @RequestParam(required = false) Boolean activo,
      @RequestParam(required = false) Long idRol,
      @PageableDefault(size = 20, sort = "nombre") Pageable p) {
    return service.buscar(q, activo, idRol, p);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('usuarios.consultar')")
  @Operation(summary = "Consultar detalle de usuario")
  public UsuarioResponse obtener(@PathVariable Long id) {
    return service.obtener(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('usuarios.registrar')")
  @Operation(summary = "Registrar usuario")
  public UsuarioResponse registrar(@Valid @RequestBody UsuarioCreateRequest r) {
    return service.registrar(r);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('usuarios.modificar')")
  @Operation(summary = "Actualizar usuario")
  public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest r) {
    return service.actualizar(id, r);
  }

  @PatchMapping("/{id}/estado")
  @PreAuthorize("hasAuthority('usuarios.desactivar')")
  @Operation(summary = "Activar o desactivar usuario")
  public UsuarioResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
    return service.cambiarEstado(id, r);
  }

  @PutMapping("/{id}/rol")
  @PreAuthorize("hasAuthority('usuarios.rol.asignar')")
  @Operation(summary = "Asignar rol vigente a usuario")
  public UsuarioResponse rol(@PathVariable Long id, @Valid @RequestBody AsignarRolRequest r) {
    return service.asignarRol(id, r);
  }
}
