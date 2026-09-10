package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import org.springframework.data.domain.Pageable;

public interface ServicioService {
    PageResponse<ServicioResponse> buscar(String q, Boolean activo, Long idCategoria, String tipoServicio, Pageable pageable);
    ServicioResponse obtener(Long id);
    ServicioResponse registrar(ServicioCreateRequest request);
    ServicioResponse actualizar(Long id, ServicioUpdateRequest request);
    ServicioResponse cambiarEstado(Long id, EstadoRequest request);
}
