package mx.com.mesaregia.clientes.api.controller;

import mx.com.mesaregia.clientes.api.response.*;
import mx.com.mesaregia.clientes.application.service.ClienteProspectoService;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/clientes-prospectos")
@PreAuthorize("hasAuthority('ROLE_INTERNAL_SERVICE')")
public class InternalClientesController {
  private final ClienteProspectoService service;

  public InternalClientesController(ClienteProspectoService s) {
    service = s;
  }

  @GetMapping("/{id}")
  public ClienteProspectoDetalleResponse obtener(@PathVariable Long id) {
    return service.obtenerDetalle(id);
  }

  @GetMapping
  public PageResponse<ClienteProspectoResponse> buscar(@RequestParam(required = false) String q,
      @RequestParam(required = false) String contacto,
      @RequestParam(required = false) EstadoClienteProspecto estado, @RequestParam(required = false) Boolean activo,
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "200") int size) {
    return service.buscar(q, contacto, estado, activo, PageRequest.of(page, Math.min(size, 200)));
  }
}
