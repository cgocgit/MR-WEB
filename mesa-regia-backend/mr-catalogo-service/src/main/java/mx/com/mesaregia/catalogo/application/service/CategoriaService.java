package mx.com.mesaregia.catalogo.application.service;

import mx.com.mesaregia.catalogo.api.request.*;
import mx.com.mesaregia.catalogo.api.response.CategoriaResponse;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;

import java.util.List;

public interface CategoriaService {
    List<CategoriaResponse> buscar(AmbitoCategoria ambito, Boolean activo, String q);
    CategoriaResponse registrar(CategoriaCreateRequest request);
    CategoriaResponse actualizar(Long id, CategoriaUpdateRequest request);
    CategoriaResponse cambiarEstado(Long id, EstadoRequest request);
}
