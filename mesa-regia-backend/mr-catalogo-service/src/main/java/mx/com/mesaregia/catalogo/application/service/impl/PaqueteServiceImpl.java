package mx.com.mesaregia.catalogo.application.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.PaqueteService;
import mx.com.mesaregia.catalogo.domain.entity.*;
import mx.com.mesaregia.catalogo.domain.enums.TipoComponente;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PaqueteServiceImpl implements PaqueteService {
    private final PaqueteRepository paqueteRepository;
    private final PaqueteDetalleRepository detalleRepository;
    private final ProductoRepository productoRepository;
    private final ServicioRepository servicioRepository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaqueteResponse> buscar(String q, Boolean activo, Pageable pageable) {
        var page = paqueteRepository.findAll(CatalogoSpecifications.paquete(q, activo), pageable);
        if (page.isEmpty()) return PageResponse.from(page.map(e -> mapper.paquete(e, 0)));

        Map<Long, Long> counts = detalleRepository.countByPaqueteIds(
                        page.getContent().stream().map(Paquete::getId).toList())
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        PaqueteComponenteCount::getIdPaquete,
                        PaqueteComponenteCount::getCantidad));

        return PageResponse.from(page.map(e -> mapper.paquete(e, counts.getOrDefault(e.getId(), 0L))));
    }

    @Override
    @Transactional(readOnly = true)
    public PaqueteDetalleResponse obtener(Long id) {
        return detail(entity(id));
    }

    @Override
    @Transactional
    public PaqueteDetalleResponse registrar(PaqueteCreateRequest request) {
        String codigo = normalizeCode(request.codigo());
        if (paqueteRepository.existsByCodigo(codigo)) throw new ConflictException("El código de paquete ya existe");
        List<PaqueteComponenteRequest> componentes = request.componentes() == null ? List.of() : request.componentes();
        validateComponents(componentes);
        if (Boolean.TRUE.equals(request.activo()) && componentes.isEmpty()) {
            throw new BusinessRuleException("Un paquete debe contener al menos un componente antes de activarse");
        }
        Paquete e = new Paquete();
        e.setCodigo(codigo);
        e.setNombre(request.nombre().trim());
        e.setDescripcion(trimToNull(request.descripcion()));
        e.setActivo(request.activo());
        e = paqueteRepository.save(e);
        if (!componentes.isEmpty()) persistComponents(e, componentes);
        events.publish("CATALOGO_PAQUETE_CREADO", e.getId());
        return detail(e);
    }

    @Override
    @Transactional
    public PaqueteDetalleResponse actualizar(Long id, PaqueteUpdateRequest request) {
        Paquete e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String codigo = normalizeCode(request.codigo());
        if (paqueteRepository.existsByCodigoAndIdNot(codigo, id)) throw new ConflictException("El código de paquete ya existe");
        e.setCodigo(codigo);
        e.setNombre(request.nombre().trim());
        e.setDescripcion(trimToNull(request.descripcion()));
        paqueteRepository.flush();
        events.publish("CATALOGO_PAQUETE_ACTUALIZADO", e.getId());
        return detail(e);
    }

    @Override
    @Transactional
    public PaqueteDetalleResponse cambiarEstado(Long id, EstadoRequest request) {
        Paquete e = entity(id);
        checkVersion(e.getVersion(), request.version());
        if (Boolean.TRUE.equals(request.activo()) && detalleRepository.countByPaqueteId(id) == 0) {
            throw new BusinessRuleException("Un paquete debe contener al menos un componente antes de activarse");
        }
        e.setActivo(request.activo());
        paqueteRepository.flush();
        events.publish("CATALOGO_PAQUETE_ESTADO_CAMBIADO", e.getId());
        return detail(e);
    }

    @Override
    @Transactional(readOnly = true)
    public PaqueteDetalleResponse obtenerComponentes(Long id) {
        return detail(entity(id));
    }

    @Override
    @Transactional
    public PaqueteDetalleResponse actualizarComponentes(Long id, PaqueteComponentesUpdateRequest request) {
        Paquete e = entity(id);
        checkVersion(e.getVersion(), request.version());
        validateComponents(request.componentes());
        entityManager.lock(e, LockModeType.OPTIMISTIC_FORCE_INCREMENT);
        if (e.isActivo() && request.componentes().isEmpty()) {
            throw new BusinessRuleException("Un paquete activo debe conservar al menos un componente");
        }
        detalleRepository.deleteByPaqueteId(id);
        detalleRepository.flush();
        persistComponents(e, request.componentes());
        entityManager.flush();
        events.publish("CATALOGO_PAQUETE_COMPONENTES_ACTUALIZADOS", e.getId());
        return detail(e);
    }

    private void validateComponents(List<PaqueteComponenteRequest> componentes) {
        Set<String> keys = new HashSet<>();
        for (PaqueteComponenteRequest item : componentes) {
            String key = item.tipo() + ":" + item.idConcepto();
            if (!keys.add(key)) throw new BusinessRuleException("No se permiten componentes duplicados dentro del paquete");
        }
    }

    private void persistComponents(Paquete paquete, List<PaqueteComponenteRequest> componentes) {
        List<PaqueteDetalle> entities = new ArrayList<>();
        int defaultOrder = 1;
        for (PaqueteComponenteRequest item : componentes) {
            PaqueteDetalle d = new PaqueteDetalle();
            d.setPaquete(paquete);
            d.setCantidad(item.cantidad());
            d.setOrden(item.orden() == null ? defaultOrder : item.orden());
            if (item.tipo() == TipoComponente.PRODUCTO) {
                Producto p = productoRepository.findById(item.idConcepto())
                        .orElseThrow(() -> new ResourceNotFoundException("El producto componente no existe"));
                if (!p.isActivo()) throw new BusinessRuleException("Solo se pueden agregar productos activos a un paquete");
                d.setProducto(p);
            } else {
                Servicio s = servicioRepository.findById(item.idConcepto())
                        .orElseThrow(() -> new ResourceNotFoundException("El servicio componente no existe"));
                if (!s.isActivo()) throw new BusinessRuleException("Solo se pueden agregar servicios activos a un paquete");
                d.setServicio(s);
            }
            entities.add(d);
            defaultOrder++;
        }
        detalleRepository.saveAll(entities);
    }

    private PaqueteDetalleResponse detail(Paquete e) {
        List<PaqueteComponenteResponse> componentes = detalleRepository.findByPaqueteIdOrderByOrdenAscIdAsc(e.getId()).stream()
                .map(mapper::componente)
                .toList();
        return new PaqueteDetalleResponse(mapper.paquete(e, componentes.size()), componentes);
    }

    private Paquete entity(Long id) { return paqueteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El paquete no existe")); }
    private void checkVersion(Long current, Long expected) { if (!Objects.equals(current, expected)) throw new ConflictException("El paquete fue modificado por otra operación"); }
    private String normalizeCode(String value) { return value.trim().toUpperCase(Locale.ROOT); }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
