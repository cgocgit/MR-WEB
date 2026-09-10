package mx.com.mesaregia.clientes.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.*;
import mx.com.mesaregia.clientes.application.service.ClienteProspectoService;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clientes-prospectos")
@RequiredArgsConstructor
public class ClienteProspectoController {
  private final ClienteProspectoService service;

  @GetMapping
  @PreAuthorize("hasAnyAuthority('clientes.consultar','clientes.buscar')")
  public PageResponse<ClienteProspectoResponse> buscar(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String contacto,
      @RequestParam(required = false) EstadoClienteProspecto estado,
      @RequestParam(required = false) Boolean activo,
      Pageable pageable) {
    return service.buscar(q, contacto, estado, activo, pageable);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('clientes.consultar')")
  public ClienteProspectoDetalleResponse obtener(@PathVariable Long id) {
    return service.obtenerDetalle(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('clientes.registrar')")
  public ClienteProspectoDetalleResponse registrar(@Valid @RequestBody ClienteProspectoCreateRequest request) {
    return service.registrarProspecto(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('clientes.modificar')")
  public ClienteProspectoDetalleResponse actualizar(@PathVariable Long id,
      @Valid @RequestBody ClienteProspectoUpdateRequest request) {
    return service.actualizar(id, request);
  }

  @PostMapping("/{id}/clasificacion")
  @PreAuthorize("hasAuthority('clientes.clasificar')")
  public ClasificacionResponse clasificar(@PathVariable Long id, @Valid @RequestBody ClasificacionRequest request) {
    return service.clasificar(id, request);
  }
}
