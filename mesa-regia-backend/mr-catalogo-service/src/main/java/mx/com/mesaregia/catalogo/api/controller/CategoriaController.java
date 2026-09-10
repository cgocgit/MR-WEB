package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.CategoriaResponse;
import mx.com.mesaregia.catalogo.application.service.CategoriaService;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Consultar categorías")
    public List<CategoriaResponse> buscar(@RequestParam(required = false) AmbitoCategoria ambito,
                                          @RequestParam(required = false) Boolean activo,
                                          @RequestParam(required = false) String q) {
        return service.buscar(ambito, activo, q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Registrar categoría")
    public CategoriaResponse registrar(@Valid @RequestBody CategoriaCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Actualizar categoría")
    public CategoriaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.auxiliares.gestionar')")
    @Operation(summary = "Activar o desactivar categoría")
    public CategoriaResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }
}
