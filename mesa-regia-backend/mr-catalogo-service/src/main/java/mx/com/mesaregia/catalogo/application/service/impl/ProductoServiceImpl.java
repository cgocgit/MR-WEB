package mx.com.mesaregia.catalogo.application.service.impl;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.ProductoService;
import mx.com.mesaregia.catalogo.domain.entity.*;
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
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoProductoRepository tipoProductoRepository;
    private final ColorRepository colorRepository;
    private final CatalogoMapper mapper;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> buscar(String q, Boolean activo, Long idCategoria, Long idTipoProducto, Long idColor, Pageable pageable) {
        return PageResponse.from(productoRepository
                .findAll(CatalogoSpecifications.producto(q, activo, idCategoria, idTipoProducto, idColor), pageable)
                .map(mapper::producto));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return mapper.producto(entity(id));
    }

    @Override
    @Transactional
    public ProductoResponse registrar(ProductoCreateRequest request) {
        String codigo = normalizeCode(request.codigo());
        if (productoRepository.existsByCodigo(codigo)) throw new ConflictException("El código de producto ya existe");
        Producto e = new Producto();
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.idCategoria(), request.idTipoProducto(), request.idColor(), request.unidadMedida(), request.precioBase());
        e.setActivo(request.activo());
        e = productoRepository.save(e);
        events.publish("CATALOGO_PRODUCTO_CREADO", e.getId());
        return mapper.producto(e);
    }

    @Override
    @Transactional
    public ProductoResponse actualizar(Long id, ProductoUpdateRequest request) {
        Producto e = entity(id);
        checkVersion(e.getVersion(), request.version());
        String codigo = normalizeCode(request.codigo());
        if (productoRepository.existsByCodigoAndIdNot(codigo, id)) throw new ConflictException("El código de producto ya existe");
        apply(e, request.codigo(), request.nombre(), request.descripcion(), request.idCategoria(), request.idTipoProducto(), request.idColor(), request.unidadMedida(), request.precioBase());
        productoRepository.flush();
        events.publish("CATALOGO_PRODUCTO_ACTUALIZADO", e.getId());
        return mapper.producto(e);
    }

    @Override
    @Transactional
    public ProductoResponse cambiarEstado(Long id, EstadoRequest request) {
        Producto e = entity(id);
        checkVersion(e.getVersion(), request.version());
        e.setActivo(request.activo());
        productoRepository.flush();
        events.publish("CATALOGO_PRODUCTO_ESTADO_CAMBIADO", e.getId());
        return mapper.producto(e);
    }

    private void apply(Producto e, String codigo, String nombre, String descripcion, Long idCategoria, Long idTipoProducto,
                       Long idColor, String unidadMedida, java.math.BigDecimal precioBase) {
        Categoria categoria = categoria(idCategoria, AmbitoCategoria.PRODUCTO);
        TipoProducto tipo = tipoProductoRepository.findById(idTipoProducto)
                .orElseThrow(() -> new ResourceNotFoundException("El tipo de producto no existe"));
        if (!tipo.isActivo()) throw new BusinessRuleException("El tipo de producto seleccionado está inactivo");
        Color color = null;
        if (idColor != null) {
            color = colorRepository.findById(idColor).orElseThrow(() -> new ResourceNotFoundException("El color no existe"));
            if (!color.isActivo()) throw new BusinessRuleException("El color seleccionado está inactivo");
        }
        e.setCodigo(normalizeCode(codigo));
        e.setNombre(nombre.trim());
        e.setDescripcion(trimToNull(descripcion));
        e.setCategoria(categoria);
        e.setTipoProducto(tipo);
        e.setColor(color);
        e.setUnidadMedida(unidadMedida.trim());
        e.setPrecioBase(precioBase);
    }

    private Categoria categoria(Long id, AmbitoCategoria ambito) {
        Categoria c = categoriaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("La categoría no existe"));
        if (c.getAmbito() != ambito) throw new BusinessRuleException("La categoría seleccionada no pertenece al ámbito PRODUCTO");
        if (!c.isActivo()) throw new BusinessRuleException("La categoría seleccionada está inactiva");
        return c;
    }

    private Producto entity(Long id) {
        return productoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("El producto no existe"));
    }

    private void checkVersion(Long current, Long expected) {
        if (!java.util.Objects.equals(current, expected)) throw new ConflictException("El producto fue modificado por otra operación");
    }

    private String normalizeCode(String value) { return value.trim().toUpperCase(java.util.Locale.ROOT); }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
