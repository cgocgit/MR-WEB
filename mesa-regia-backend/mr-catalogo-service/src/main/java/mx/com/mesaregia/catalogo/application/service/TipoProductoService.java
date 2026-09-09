package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.AuxiliarCreateRequest;
import mx.com.mesaregia.catalogo.api.request.AuxiliarUpdateRequest;
import mx.com.mesaregia.catalogo.api.request.EstadoRequest;
import mx.com.mesaregia.catalogo.api.response.TipoProductoResponse;

import java.util.List;

public interface TipoProductoService {
    List<TipoProductoResponse> buscar(Boolean activo, String q);
    TipoProductoResponse registrar(AuxiliarCreateRequest request);
    TipoProductoResponse actualizar(Long id, AuxiliarUpdateRequest request);
    TipoProductoResponse cambiarEstado(Long id, EstadoRequest request);
}
