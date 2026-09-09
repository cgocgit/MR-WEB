package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.*;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ListaPrecioService {
    PageResponse<ListaPrecioResponse> buscar(String q, Boolean activo, LocalDate vigenteEn, Pageable pageable);
    ListaPrecioConDetallesResponse obtener(Long id);
    ListaPrecioResponse registrar(ListaPrecioCreateRequest request);
    ListaPrecioResponse actualizar(Long id, ListaPrecioUpdateRequest request);
    ListaPrecioResponse cambiarEstado(Long id, EstadoRequest request);
    ListaPrecioConDetallesResponse obtenerPrecios(Long id);
    ListaPrecioConDetallesResponse actualizarPrecios(Long id, ListaPrecioDetallesUpdateRequest request);
}
