package mx.com.mesaregia.catalogo.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.TipoProductoResponse;
import mx.com.mesaregia.catalogo.application.service.TipoProductoService;
import mx.com.mesaregia.catalogo.domain.entity.TipoProducto;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.TipoProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoProductoServiceImpl implements TipoProductoService {
    private final TipoProductoRepository repository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public List<TipoProductoResponse> buscar(Boolean activo, String q) {
        String text = q == null ? null : q.trim().toLowerCase();
        return repository.findAllByOrderByNombreAsc().stream()
                .filter(e -> activo == null || e.isActivo() == activo)
                .filter(e -> text == null || text.isBlank() || e.getNombre().toLowerCase().contains(text))
                .map(mapper::tipoProducto)
                .toList();
    }

    @Override
    @Transactional
    public TipoProductoResponse registrar(AuxiliarCreateRequest request) {
        String nombre = request.nombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) throw new ConflictException("El tipo de producto ya existe");
        TipoProducto e = new TipoProducto();
        e.setNombre(nombre);
        e.setActivo(request.activo());
        e = repository.save(e);
        events.publish("CATALOGO_TIPO_PRODUCTO_CREADO", e.getId());
        return mapper.tipoProducto(e);
    }

    @Override
    @Transactional
    public TipoProductoResponse actualizar(Long id, AuxiliarUpdateRequest request) {
        TipoProducto e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String nombre = request.nombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) throw new ConflictException("El tipo de producto ya existe");
        e.setNombre(nombre);
        repository.flush();
        events.publish("CATALOGO_TIPO_PRODUCTO_ACTUALIZADO", e.getId());
        return mapper.tipoProducto(e);
    }

    @Override
    @Transactional
    public TipoProductoResponse cambiarEstado(Long id, EstadoRequest request) {
        TipoProducto e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        repository.flush();
        events.publish("CATALOGO_TIPO_PRODUCTO_ESTADO_CAMBIADO", e.getId());
        return mapper.tipoProducto(e);
    }

    private TipoProducto entity(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El tipo de producto no existe")); }
    private void checkVersion(Long current, Long expected) { if (!java.util.Objects.equals(current, expected)) throw new ConflictException("El tipo de producto fue modificado por otra operación"); }
}
