package mx.com.mesaregia.clientes.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.ContactoResponse;
import mx.com.mesaregia.clientes.application.service.ContactoService;
import mx.com.mesaregia.clientes.domain.entity.*;
import mx.com.mesaregia.clientes.exception.*;
import mx.com.mesaregia.clientes.integration.event.DomainEventPublisher;
import mx.com.mesaregia.clientes.mapper.ClientesMapper;
import mx.com.mesaregia.clientes.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ContactoServiceImpl implements ContactoService {
    private final ClienteProspectoRepository clienteRepository;
    private final ContactoRepository contactoRepository;
    private final ClientesMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public List<ContactoResponse> listar(Long clienteId) {
        ensureCliente(clienteId);
        return contactoRepository.findByClienteProspectoIdOrderByEsPrincipalDescIdAsc(clienteId).stream().map(mapper::contacto).toList();
    }

    @Override
    @Transactional
    public ContactoResponse registrar(Long clienteId, ContactoCreateRequest request) {
        ClienteProspecto cliente = ensureCliente(clienteId);
        String medio = request.medioContacto().trim();
        if (contactoRepository.existsByClienteProspectoIdAndTipoMedioContactoAndMedioContactoIgnoreCase(clienteId, request.tipoMedioContacto(), medio)) {
            throw new ConflictException("El medio de contacto ya está registrado para este cliente o prospecto");
        }
        Contacto e = new Contacto();
        e.setClienteProspecto(cliente);
        apply(e, request.tipoMedioContacto(), medio, request.esPrincipal());
        e.setActivo(true);
        e = contactoRepository.saveAndFlush(e);
        events.publish("CLIENTE_CONTACTO_CREADO", clienteId, Map.of("contactoId", e.getId()));
        return mapper.contacto(e);
    }

    @Override
    @Transactional
    public ContactoResponse actualizar(Long clienteId, Long contactoId, ContactoUpdateRequest request) {
        ensureCliente(clienteId);
        Contacto e = entity(clienteId, contactoId);
        checkVersion(e.getVersion(), request.version());
        String medio = request.medioContacto().trim();
        if (contactoRepository.existsByClienteProspectoIdAndTipoMedioContactoAndMedioContactoIgnoreCaseAndIdNot(
                clienteId, request.tipoMedioContacto(), medio, contactoId)) {
            throw new ConflictException("El medio de contacto ya está registrado para este cliente o prospecto");
        }
        apply(e, request.tipoMedioContacto(), medio, request.esPrincipal());
        contactoRepository.flush();
        events.publish("CLIENTE_CONTACTO_ACTUALIZADO", clienteId, Map.of("contactoId", e.getId()));
        return mapper.contacto(e);
    }

    @Override
    @Transactional
    public ContactoResponse cambiarEstado(Long clienteId, Long contactoId, ContactoEstadoRequest request) {
        ensureCliente(clienteId);
        Contacto e = entity(clienteId, contactoId);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        contactoRepository.flush();
        events.publish("CLIENTE_CONTACTO_ESTADO_CAMBIADO", clienteId, Map.of("contactoId", e.getId(), "activo", e.isActivo()));
        return mapper.contacto(e);
    }

    private void apply(Contacto e, mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto tipo, String medio, boolean principal) {
        e.setTipoMedioContacto(tipo);
        e.setMedioContacto(medio);
        e.setEsPrincipal(principal);
    }

    private ClienteProspecto ensureCliente(Long id) {
        return clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El cliente o prospecto no existe"));
    }

    private Contacto entity(Long clienteId, Long contactoId) {
        return contactoRepository.findByIdAndClienteProspectoId(contactoId, clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("El contacto no existe para el cliente o prospecto indicado"));
    }

    private void checkVersion(Long actual, Long expected) {
        if (!Objects.equals(actual, expected)) throw new ConflictException("El contacto fue modificado por otra operación");
    }
}
