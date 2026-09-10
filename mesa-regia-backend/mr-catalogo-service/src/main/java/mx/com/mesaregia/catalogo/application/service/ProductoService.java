package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import org.springframework.data.domain.Pageable;

public interface ProductoService {
    PageResponse<ProductoResponse> buscar(String q, Boolean activo, Long idCategoria, Long idTipoProducto, Long idColor, Pageable pageable);
    ProductoResponse obtener(Long id);
    ProductoResponse registrar(ProductoCreateRequest request);
    ProductoResponse actualizar(Long id, ProductoUpdateRequest request);
    ProductoResponse cambiarEstado(Long id, EstadoRequest request);
}
