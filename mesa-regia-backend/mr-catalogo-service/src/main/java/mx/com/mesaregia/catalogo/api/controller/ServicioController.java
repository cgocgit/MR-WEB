package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ServicioService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/servicios")
@RequiredArgsConstructor
public class ServicioController {
    private final ServicioService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar servicios")
    public PageResponse<ServicioResponse> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Long idCategoria,
            @RequestParam(required = false) String tipoServicio,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return service.buscar(q, activo, idCategoria, tipoServicio, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar detalle de servicio")
    public ServicioResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.servicios.registrar')")
    @Operation(summary = "Registrar servicio")
    public ServicioResponse registrar(@Valid @RequestBody ServicioCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.servicios.modificar')")
    @Operation(summary = "Actualizar servicio")
    public ServicioResponse actualizar(@PathVariable Long id, @Valid @RequestBody ServicioUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.servicios.desactivar')")
    @Operation(summary = "Activar o desactivar servicio")
    public ServicioResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }
}
