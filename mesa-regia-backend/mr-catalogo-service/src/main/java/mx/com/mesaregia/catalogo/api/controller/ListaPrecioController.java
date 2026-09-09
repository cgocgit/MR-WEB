package mx.com.mesaregia.catalogo.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ListaPrecioService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/listas-precios")
@RequiredArgsConstructor
public class ListaPrecioController {
    private final ListaPrecioService service;

    @GetMapping
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Consultar listas de precios")
    public PageResponse<ListaPrecioResponse> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) LocalDate vigenteEn,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return service.buscar(q, activo, vigenteEn, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Consultar detalle de lista de precios")
    public ListaPrecioConDetallesResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Registrar lista de precios")
    public ListaPrecioResponse registrar(@Valid @RequestBody ListaPrecioCreateRequest request) { return service.registrar(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Actualizar lista de precios")
    public ListaPrecioResponse actualizar(@PathVariable Long id, @Valid @RequestBody ListaPrecioUpdateRequest request) { return service.actualizar(id, request); }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Activar o desactivar lista de precios")
    public ListaPrecioResponse estado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) { return service.cambiarEstado(id, request); }

    @GetMapping("/{id}/precios")
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Consultar precios asignados a productos y paquetes")
    public ListaPrecioConDetallesResponse precios(@PathVariable Long id) { return service.obtenerPrecios(id); }

    @PutMapping("/{id}/precios")
    @PreAuthorize("hasAuthority('catalogo.precios.gestionar')")
    @Operation(summary = "Actualizar precios de productos y paquetes")
    public ListaPrecioConDetallesResponse actualizarPrecios(@PathVariable Long id, @Valid @RequestBody ListaPrecioDetallesUpdateRequest request) {
        return service.actualizarPrecios(id, request);
    }
}
