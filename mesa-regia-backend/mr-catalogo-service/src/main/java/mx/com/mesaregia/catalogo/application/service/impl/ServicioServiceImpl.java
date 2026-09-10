package mx.com.mesaregia.catalogo.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ServicioService;
import mx.com.mesaregia.catalogo.domain.entity.Categoria;
import mx.com.mesaregia.catalogo.domain.entity.Servicio;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServicioServiceImpl implements ServicioService {
    private final ServicioRepository servicioRepository;
    private final CategoriaRepository categoriaRepository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ServicioResponse> buscar(String q, Boolean activo, Long idCategoria, String tipoServicio, Pageable pageable) {
        return PageResponse.from(servicioRepository
                .findAll(CatalogoSpecifications.servicio(q, activo, idCategoria, tipoServicio), pageable)
                .map(mapper::servicio));
    }

    @Override
    @Transactional(readOnly = true)
    public ServicioResponse obtener(Long id) {
        return mapper.servicio(entity(id));
    }

    @Override
    @Transactional
    public ServicioResponse registrar(ServicioCreateRequest request) {
        String codigo = normalizeCode(request.codigo());
        if (servicioRepository.existsByCodigo(codigo)) throw new ConflictException("El código de servicio ya existe");
        Servicio e = new Servicio();
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.idCategoria(), request.tipoServicio(), request.tarifaBase());
        e.setActivo(request.activo());
        e = servicioRepository.save(e);
        events.publish("CATALOGO_SERVICIO_CREADO", e.getId());
        return mapper.servicio(e);
    }

    @Override
    @Transactional
    public ServicioResponse actualizar(Long id, ServicioUpdateRequest request) {
        Servicio e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String codigo = normalizeCode(request.codigo());
        if (servicioRepository.existsByCodigoAndIdNot(codigo, id)) throw new ConflictException("El código de servicio ya existe");
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.idCategoria(), request.tipoServicio(), request.tarifaBase());
        servicioRepository.flush();
        events.publish("CATALOGO_SERVICIO_ACTUALIZADO", e.getId());
        return mapper.servicio(e);
    }

    @Override
    @Transactional
    public ServicioResponse cambiarEstado(Long id, EstadoRequest request) {
        Servicio e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        servicioRepository.flush();
        events.publish("CATALOGO_SERVICIO_ESTADO_CAMBIADO", e.getId());
        return mapper.servicio(e);
    }

    private void apply(Servicio e, String codigo, String nombre, String descripcion, Long idCategoria,
                       String tipoServicio, java.math.BigDecimal tarifaBase) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new ResourceNotFoundException("La categoría no existe"));
        if (categoria.getAmbito() != AmbitoCategoria.SERVICIO) throw new BusinessRuleException("La categoría seleccionada no pertenece al ámbito SERVICIO");
        if (!categoria.isActivo()) throw new BusinessRuleException("La categoría seleccionada está inactiva");
        e.setCodigo(normalizeCode(codigo));
        e.setNombre(nombre.trim());
        e.setDescripcion(trimToNull(descripcion));
        e.setCategoria(categoria);
        e.setTipoServicio(tipoServicio.trim());
        e.setTarifaBase(tarifaBase);
    }

    private Servicio entity(Long id) {
        return servicioRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El servicio no existe"));
    }

    private void checkVersion(Long current, Long expected) {
        if (!java.util.Objects.equals(current, expected)) throw new ConflictException("El servicio fue modificado por otra operación");
    }

    private String normalizeCode(String value) { return value.trim().toUpperCase(java.util.Locale.ROOT); }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
