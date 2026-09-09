package mx.com.mesaregia.catalogo.application.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ListaPrecioService;
import mx.com.mesaregia.catalogo.domain.entity.*;
import mx.com.mesaregia.catalogo.domain.enums.TipoConceptoPrecio;
import mx.com.mesaregia.catalogo.exception.*;
import mx.com.mesaregia.catalogo.integration.event.DomainEventPublisher;
import mx.com.mesaregia.catalogo.mapper.CatalogoMapper;
import mx.com.mesaregia.catalogo.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ListaPrecioServiceImpl implements ListaPrecioService {
    private final ListaPrecioRepository listaRepository;
    private final ListaPrecioDetalleRepository detalleRepository;
    private final ProductoRepository productoRepository;
    private final PaqueteRepository paqueteRepository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ListaPrecioResponse> buscar(String q, Boolean activo, LocalDate vigenteEn, Pageable pageable) {
        return PageResponse.from(listaRepository
                .findAll(CatalogoSpecifications.listaPrecio(q, activo, vigenteEn), pageable)
                .map(mapper::listaPrecio));
    }

    @Override
    @Transactional(readOnly = true)
    public ListaPrecioConDetallesResponse obtener(Long id) {
        return full(entity(id));
    }

    @Override
    @Transactional
    public ListaPrecioResponse registrar(ListaPrecioCreateRequest request) {
        validateDates(request.vigenciaInicio(), request.vigenciaFin());
        String codigo = normalizeCode(request.codigo());
        if (listaRepository.existsByCodigo(codigo)) throw new ConflictException("El código de lista de precios ya existe");
        ListaPrecio e = new ListaPrecio();
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.vigenciaInicio(), request.vigenciaFin(), request.porcentajeAdicionalFueraLista());
        e.setActivo(request.activo());
        e = listaRepository.save(e);
        events.publish("CATALOGO_LISTA_PRECIO_CREADA", e.getId());
        return mapper.listaPrecio(e);
    }

    @Override
    @Transactional
    public ListaPrecioResponse actualizar(Long id, ListaPrecioUpdateRequest request) {
        ListaPrecio e = entity(id);
        checkVersion(e.getVersion(), request.version());
        validateDates(request.vigenciaInicio(), request.vigenciaFin());
        String codigo = normalizeCode(request.codigo());
        if (listaRepository.existsByCodigoAndIdNot(codigo, id)) throw new ConflictException("El código de lista de precios ya existe");
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.vigenciaInicio(), request.vigenciaFin(), request.porcentajeAdicionalFueraLista());
        listaRepository.flush();
        events.publish("CATALOGO_LISTA_PRECIO_ACTUALIZADA", e.getId());
        return mapper.listaPrecio(e);
    }

    @Override
    @Transactional
    public ListaPrecioResponse cambiarEstado(Long id, EstadoRequest request) {
        ListaPrecio e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        listaRepository.flush();
        events.publish("CATALOGO_LISTA_PRECIO_ESTADO_CAMBIADO", e.getId());
        return mapper.listaPrecio(e);
    }

    @Override
    @Transactional(readOnly = true)
    public ListaPrecioConDetallesResponse obtenerPrecios(Long id) {
        return full(entity(id));
    }

    @Override
    @Transactional
    public ListaPrecioConDetallesResponse actualizarPrecios(Long id, ListaPrecioDetallesUpdateRequest request) {
        ListaPrecio lista = entity(id);
        checkVersion(lista.getVersion(), request.version());
        validateNoDuplicates(request.precios());
        entityManager.lock(lista, LockModeType.OPTIMISTIC_FORCE_INCREMENT);

        List<ListaPrecioDetalle> existing = detalleRepository.findByListaPrecioIdOrderByIdAsc(id);
        existing.forEach(e -> e.setActivo(false));

        for (ListaPrecioDetalleItemRequest item : request.precios()) {
            ListaPrecioDetalle detail = findOrCreate(lista, item);
            detail.setPrecio(item.precio());
            detail.setActivo(item.activo());
            detalleRepository.save(detail);
        }
        entityManager.flush();
        events.publish("CATALOGO_LISTA_PRECIO_DETALLE_ACTUALIZADO", lista.getId());
        return full(lista);
    }

    private ListaPrecioDetalle findOrCreate(ListaPrecio lista, ListaPrecioDetalleItemRequest item) {
        if (item.tipo() == TipoConceptoPrecio.PRODUCTO) {
            Producto producto = productoRepository.findById(item.idConcepto())
                    .orElseThrow(() -> new ResourceNotFoundException("El producto indicado para la lista no existe"));
            return detalleRepository.findByListaPrecioIdAndProductoId(lista.getId(), producto.getId())
                    .orElseGet(() -> {
                        ListaPrecioDetalle d = new ListaPrecioDetalle();
                        d.setListaPrecio(lista);
                        d.setProducto(producto);
                        return d;
                    });
        }
        Paquete paquete = paqueteRepository.findById(item.idConcepto())
                .orElseThrow(() -> new ResourceNotFoundException("El paquete indicado para la lista no existe"));
        return detalleRepository.findByListaPrecioIdAndPaqueteId(lista.getId(), paquete.getId())
                .orElseGet(() -> {
                    ListaPrecioDetalle d = new ListaPrecioDetalle();
                    d.setListaPrecio(lista);
                    d.setPaquete(paquete);
                    return d;
                });
    }

    private void validateNoDuplicates(List<ListaPrecioDetalleItemRequest> items) {
        Set<String> keys = new HashSet<>();
        for (ListaPrecioDetalleItemRequest item : items) {
            String key = item.tipo() + ":" + item.idConcepto();
            if (!keys.add(key)) throw new BusinessRuleException("No se permiten conceptos duplicados dentro de una lista de precios");
        }
    }

    private ListaPrecioConDetallesResponse full(ListaPrecio lista) {
        return new ListaPrecioConDetallesResponse(
                mapper.listaPrecio(lista),
                detalleRepository.findByListaPrecioIdOrderByIdAsc(lista.getId()).stream().map(mapper::precio).toList());
    }

    private void apply(ListaPrecio e, String codigo, String nombre, String descripcion, LocalDate inicio, LocalDate fin, java.math.BigDecimal adicional) {
        e.setCodigo(normalizeCode(codigo));
        e.setNombre(nombre.trim());
        e.setDescripcion(trimToNull(descripcion));
        e.setVigenciaInicio(inicio);
        e.setVigenciaFin(fin);
        e.setPorcentajeAdicionalFueraLista(adicional);
    }

    private void validateDates(LocalDate inicio, LocalDate fin) {
        if (fin.isBefore(inicio)) throw new BusinessRuleException("La vigencia final no puede ser anterior a la vigencia inicial");
    }

    private ListaPrecio entity(Long id) { return listaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("La lista de precios no existe")); }
    private void checkVersion(Long current, Long expected) { if (!Objects.equals(current, expected)) throw new ConflictException("La lista de precios fue modificada por otra operación"); }
    private String normalizeCode(String value) { return value.trim().toUpperCase(Locale.ROOT); }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
