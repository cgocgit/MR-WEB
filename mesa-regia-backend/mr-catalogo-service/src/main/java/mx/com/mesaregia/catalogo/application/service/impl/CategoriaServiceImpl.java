package mx.com.mesaregia.catalogo.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.CategoriaResponse;
import mx.com.mesaregia.catalogo.application.service.CategoriaService;
import mx.com.mesaregia.catalogo.domain.entity.Categoria;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {
    private final CategoriaRepository repository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> buscar(AmbitoCategoria ambito, Boolean activo, String q) {
        String text = q == null ? null : q.trim().toLowerCase();
        return repository.findAllByOrderByAmbitoAscNombreAsc().stream()
                .filter(e -> ambito == null || e.getAmbito() == ambito)
                .filter(e -> activo == null || e.isActivo() == activo)
                .filter(e -> text == null || text.isBlank() || e.getNombre().toLowerCase().contains(text))
                .map(mapper::categoria)
                .toList();
    }

    @Override
    @Transactional
    public CategoriaResponse registrar(CategoriaCreateRequest request) {
        String nombre = request.nombre().trim();
        if (repository.existsByAmbitoAndNombreIgnoreCase(request.ambito(), nombre)) throw new ConflictException("La categoría ya existe para ese ámbito");
        Categoria e = new Categoria();
        e.setNombre(nombre);
        e.setAmbito(request.ambito());
        e.setActivo(request.activo());
        e = repository.save(e);
        events.publish("CATALOGO_CATEGORIA_CREADA", e.getId());
        return mapper.categoria(e);
    }

    @Override
    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaUpdateRequest request) {
        Categoria e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String nombre = request.nombre().trim();
        if (repository.existsByAmbitoAndNombreIgnoreCaseAndIdNot(request.ambito(), nombre, id)) throw new ConflictException("La categoría ya existe para ese ámbito");
        if (e.getAmbito() != request.ambito()) {
            throw new BusinessRuleException("El ámbito de una categoría existente no puede cambiar porque puede tener referencias asociadas");
        }
        e.setNombre(nombre);
        repository.flush();
        events.publish("CATALOGO_CATEGORIA_ACTUALIZADA", e.getId());
        return mapper.categoria(e);
    }

    @Override
    @Transactional
    public CategoriaResponse cambiarEstado(Long id, EstadoRequest request) {
        Categoria e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        repository.flush();
        events.publish("CATALOGO_CATEGORIA_ESTADO_CAMBIADO", e.getId());
        return mapper.categoria(e);
    }

    private Categoria entity(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("La categoría no existe")); }
    private void checkVersion(Long current, Long expected) { if (!java.util.Objects.equals(current, expected)) throw new ConflictException("La categoría fue modificada por otra operación"); }
}
