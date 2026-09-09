package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import org.springframework.data.domain.Pageable;

public interface PaqueteService {
    PageResponse<PaqueteResponse> buscar(String q, Boolean activo, Pageable pageable);
    PaqueteDetalleResponse obtener(Long id);
    PaqueteDetalleResponse registrar(PaqueteCreateRequest request);
    PaqueteDetalleResponse actualizar(Long id, PaqueteUpdateRequest request);
    PaqueteDetalleResponse cambiarEstado(Long id, EstadoRequest request);
    PaqueteDetalleResponse obtenerComponentes(Long id);
    PaqueteDetalleResponse actualizarComponentes(Long id, PaqueteComponentesUpdateRequest request);
}
