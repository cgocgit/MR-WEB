package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.PaqueteService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/paquetes")
@RequiredArgsConstructor
public class PaqueteController {
    private final PaqueteService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar paquetes")
    public PageResponse<PaqueteResponse> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean activo,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return service.buscar(q, activo, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar detalle de paquete")
    public PaqueteDetalleResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.paquetes.registrar')")
    @Operation(summary = "Registrar paquete")
    public PaqueteDetalleResponse registrar(@Valid @RequestBody PaqueteCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.paquetes.modificar')")
    @Operation(summary = "Actualizar datos generales del paquete")
    public PaqueteDetalleResponse actualizar(@PathVariable Long id, @Valid @RequestBody PaqueteUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.paquetes.desactivar')")
    @Operation(summary = "Activar o desactivar paquete")
    public PaqueteDetalleResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }

    @GetMapping("/{id}/componentes")
    @PreAuthorize("hasAuthority('catalogo.paquetes.modificar')")
    @Operation(summary = "Consultar componentes de un paquete")
    public PaqueteDetalleResponse componentes(@PathVariable Long id) { return service.obtenerComponentes(id); }

    @PutMapping("/{id}/componentes")
    @PreAuthorize("hasAuthority('catalogo.paquetes.modificar')")
    @Operation(summary = "Actualizar componentes de un paquete")
    public PaqueteDetalleResponse actualizarComponentes(@PathVariable Long id, @Valid @RequestBody PaqueteComponentesUpdateRequest request) {
        return service.actualizarComponentes(id, request);
    }
}
