package mx.com.mesaregia.catalogo.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.ColorResponse;
import mx.com.mesaregia.catalogo.application.service.ColorService;
import mx.com.mesaregia.catalogo.domain.entity.Color;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.ColorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorServiceImpl implements ColorService {
    private final ColorRepository repository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public List<ColorResponse> buscar(Boolean activo, String q) {
        String text = q == null ? null : q.trim().toLowerCase();
        return repository.findAllByOrderByNombreAsc().stream()
                .filter(e -> activo == null || e.isActivo() == activo)
                .filter(e -> text == null || text.isBlank() || e.getNombre().toLowerCase().contains(text))
                .map(mapper::color)
                .toList();
    }

    @Override
    @Transactional
    public ColorResponse registrar(AuxiliarCreateRequest request) {
        String nombre = request.nombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) throw new ConflictException("El color ya existe");
        Color e = new Color();
        e.setNombre(nombre);
        e.setActivo(request.activo());
        e = repository.save(e);
        events.publish("CATALOGO_COLOR_CREADO", e.getId());
        return mapper.color(e);
    }

    @Override
    @Transactional
    public ColorResponse actualizar(Long id, AuxiliarUpdateRequest request) {
        Color e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String nombre = request.nombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) throw new ConflictException("El color ya existe");
        e.setNombre(nombre);
        repository.flush();
        events.publish("CATALOGO_COLOR_ACTUALIZADO", e.getId());
        return mapper.color(e);
    }

    @Override
    @Transactional
    public ColorResponse cambiarEstado(Long id, EstadoRequest request) {
        Color e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        repository.flush();
        events.publish("CATALOGO_COLOR_ESTADO_CAMBIADO", e.getId());
        return mapper.color(e);
    }

    private Color entity(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El color no existe")); }
    private void checkVersion(Long current, Long expected) { if (!java.util.Objects.equals(current, expected)) throw new ConflictException("El color fue modificado por otra operación"); }
}
