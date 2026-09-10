package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.ColorResponse;
import mx.com.mesaregia.catalogo.application.service.ColorService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/colores")
@RequiredArgsConstructor
public class ColorController {
    private final ColorService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Consultar colors")
    public List<ColorResponse> buscar(@RequestParam(required = false) Boolean activo, @RequestParam(required = false) String q) {
        return service.buscar(activo, q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Registrar color")
    public ColorResponse registrar(@Valid @RequestBody AuxiliarCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Actualizar color")
    public ColorResponse actualizar(@PathVariable Long id, @Valid @RequestBody AuxiliarUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Activar o desactivar color")
    public ColorResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }
}
