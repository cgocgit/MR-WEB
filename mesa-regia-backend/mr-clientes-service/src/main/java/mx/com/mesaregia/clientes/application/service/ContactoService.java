package mx.com.mesaregia.clientes.application.service;

import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.ContactoResponse;

import java.util.List;

public interface ContactoService {
    List<ContactoResponse> listar(Long clienteId);
    ContactoResponse registrar(Long clienteId, ContactoCreateRequest request);
    ContactoResponse actualizar(Long clienteId, Long contactoId, ContactoUpdateRequest request);
    ContactoResponse cambiarEstado(Long clienteId, Long contactoId, ContactoEstadoRequest request);
}
