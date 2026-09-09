package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.AuxiliarCreateRequest;
import mx.com.mesaregia.catalogo.api.request.AuxiliarUpdateRequest;
import mx.com.mesaregia.catalogo.api.request.EstadoRequest;
import mx.com.mesaregia.catalogo.api.response.ColorResponse;

import java.util.List;

public interface ColorService {
    List<ColorResponse> buscar(Boolean activo, String q);
    ColorResponse registrar(AuxiliarCreateRequest request);
    ColorResponse actualizar(Long id, AuxiliarUpdateRequest request);
    ColorResponse cambiarEstado(Long id, EstadoRequest request);
}
