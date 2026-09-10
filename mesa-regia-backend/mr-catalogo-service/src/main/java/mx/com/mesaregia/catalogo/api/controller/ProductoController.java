package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ProductoService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar productos")
    public PageResponse<ProductoResponse> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Long idCategoria,
            @RequestParam(required = false) Long idTipoProducto,
            @RequestParam(required = false) Long idColor,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return service.buscar(q, activo, idCategoria, idTipoProducto, idColor, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.consultar')")
    @Operation(summary = "Consultar detalle de producto")
    public ProductoResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.productos.registrar')")
    @Operation(summary = "Registrar producto")
    public ProductoResponse registrar(@Valid @RequestBody ProductoCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.productos.modificar')")
    @Operation(summary = "Actualizar producto")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.productos.desactivar')")
    @Operation(summary = "Activar o desactivar producto")
    public ProductoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }
}
