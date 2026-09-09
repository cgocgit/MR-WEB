package mx.com.mesaregia.clientes.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.ContactoResponse;
import mx.com.mesaregia.clientes.application.service.ContactoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes-prospectos/{clienteId}/contactos")
@RequiredArgsConstructor
public class ContactoController {
    private final ContactoService service;

    @GetMapping
    @PreAuthorize("hasAuthority('clientes.consultar')")
    public List<ContactoResponse> listar(@PathVariable Long clienteId) {
        return service.listar(clienteId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('clientes.modificar')")
    public ContactoResponse registrar(@PathVariable Long clienteId, @Valid @RequestBody ContactoCreateRequest request) {
        return service.registrar(clienteId, request);
    }

    @PutMapping("/{contactoId}")
    @PreAuthorize("hasAuthority('clientes.modificar')")
    public ContactoResponse actualizar(@PathVariable Long clienteId, @PathVariable Long contactoId,
                                       @Valid @RequestBody ContactoUpdateRequest request) {
        return service.actualizar(clienteId, contactoId, request);
    }

    @PatchMapping("/{contactoId}/estado")
    @PreAuthorize("hasAuthority('clientes.modificar')")
    public ContactoResponse cambiarEstado(@PathVariable Long clienteId, @PathVariable Long contactoId,
                                          @Valid @RequestBody ContactoEstadoRequest request) {
        return service.cambiarEstado(clienteId, contactoId, request);
    }
}
