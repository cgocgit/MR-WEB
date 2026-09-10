package mx.com.mesaregia.clientes.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.*;
import mx.com.mesaregia.clientes.application.service.ClienteProspectoService;
import mx.com.mesaregia.clientes.domain.entity.*;
import mx.com.mesaregia.clientes.domain.enums.*;
import mx.com.mesaregia.clientes.exception.*;
import mx.com.mesaregia.clientes.integration.event.DomainEventPublisher;
import mx.com.mesaregia.clientes.mapper.ClientesMapper;
import mx.com.mesaregia.clientes.repository.*;
import org.slf4j.MDC;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClienteProspectoServiceImpl implements ClienteProspectoService {
    private final ClienteProspectoRepository clienteRepository;
    private final ContactoRepository contactoRepository;
    private final ClientesMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ClienteProspectoResponse> buscar(String q, String contacto, EstadoClienteProspecto estado, Boolean activo, Pageable pageable) {
        return PageResponse.from(clienteRepository.findAll(ClienteProspectoSpecifications.filtro(q, contacto, estado, activo), pageable)
                .map(mapper::cliente));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteProspectoDetalleResponse obtenerDetalle(Long id) {
        ClienteProspecto e = entity(id);
        return mapper.detalle(e, contactoRepository.findByClienteProspectoIdOrderByEsPrincipalDescIdAsc(id));
    }

    @Override
    @Transactional
    public ClienteProspectoDetalleResponse registrarProspecto(ClienteProspectoCreateRequest request) {
        ClienteProspecto e = new ClienteProspecto();
        e.setNombres(request.nombres().trim());
        e.setApellidos(trimToNull(request.apellidos()));
        e.setClasificacion(Clasificacion.PROSPECTO);
        e.setEstadoProspecto(EstadoProspecto.PENDIENTE);
        e.setActivo(true);
        e = clienteRepository.saveAndFlush(e);

        List<Contacto> contactos = new ArrayList<>();
        if (request.contactos() != null) {
            Set<String> keys = new HashSet<>();
            for (ContactoCreateRequest item : request.contactos()) {
                String medio = item.medioContacto().trim();
                String key = item.tipoMedioContacto() + "|" + medio.toLowerCase(Locale.ROOT);
                if (!keys.add(key)) throw new ConflictException("La solicitud contiene medios de contacto duplicados");
                Contacto c = new Contacto();
                c.setClienteProspecto(e);
                c.setTipoMedioContacto(item.tipoMedioContacto());
                c.setMedioContacto(medio);
                c.setEsPrincipal(item.esPrincipal());
                c.setActivo(true);
                contactos.add(contactoRepository.save(c));
            }
            contactoRepository.flush();
        }
        events.publish("CLIENTE_PROSPECTO_CREADO", e.getId(), Map.of("estado", EstadoClienteProspecto.PROSPECTO.name()));
        return mapper.detalle(e, contactos);
    }

    @Override
    @Transactional
    public ClienteProspectoDetalleResponse actualizar(Long id, ClienteProspectoUpdateRequest request) {
        ClienteProspecto e = entity(id);
        checkVersion(e.getVersion(), request.version(), "El cliente o prospecto fue modificado por otra operación");
        e.setNombres(request.nombres().trim());
        e.setApellidos(trimToNull(request.apellidos()));
        clienteRepository.flush();
        events.publish("CLIENTE_PROSPECTO_ACTUALIZADO", e.getId(), Map.of("estado", mapper.estado(e).name()));
        return mapper.detalle(e, contactoRepository.findByClienteProspectoIdOrderByEsPrincipalDescIdAsc(id));
    }

    @Override
    @Transactional
    public ClasificacionResponse clasificar(Long id, ClasificacionRequest request) {
        ClienteProspecto e = entity(id);
        checkVersion(e.getVersion(), request.version(), "El registro cambió antes de confirmar la clasificación");
        EstadoClienteProspecto anterior = mapper.estado(e);
        if (anterior != EstadoClienteProspecto.PROSPECTO) {
            throw new BusinessRuleException("Solo un Prospecto pendiente puede clasificarse en esta iteración");
        }
        if (request.estadoDestino() == EstadoClienteProspecto.CLIENTE) {
            e.setClasificacion(Clasificacion.CLIENTE);
            e.setEstadoProspecto(null);
        } else if (request.estadoDestino() == EstadoClienteProspecto.PROSPECTO_REVISADO) {
            e.setClasificacion(Clasificacion.PROSPECTO);
            e.setEstadoProspecto(EstadoProspecto.REVISADO);
        } else {
            throw new BusinessRuleException("El estado destino debe ser CLIENTE o PROSPECTO_REVISADO");
        }
        clienteRepository.flush();
        EstadoClienteProspecto nuevo = mapper.estado(e);
        String correlation = MDC.get("correlationId");
        events.publish("CLIENTE_PROSPECTO_CLASIFICADO", e.getId(), Map.of(
                "estadoAnterior", anterior.name(), "estadoNuevo", nuevo.name(),
                "correlationId", correlation == null ? "" : correlation));
        return new ClasificacionResponse(e.getId(), anterior, nuevo, LocalDateTime.now(), correlation, e.getVersion());
    }

    private ClienteProspecto entity(Long id) {
        return clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El cliente o prospecto no existe"));
    }

    private void checkVersion(Long actual, Long expected, String message) {
        if (!Objects.equals(actual, expected)) throw new ConflictException(message);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
