package mx.com.mesaregia.clientes.application.service;

import mx.com.mesaregia.clientes.api.request.*;
import mx.com.mesaregia.clientes.api.response.*;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;
import org.springframework.data.domain.Pageable;

public interface ClienteProspectoService {
    PageResponse<ClienteProspectoResponse> buscar(String q, String contacto, EstadoClienteProspecto estado, Boolean activo, Pageable pageable);
    ClienteProspectoDetalleResponse obtenerDetalle(Long id);
    ClienteProspectoDetalleResponse registrarProspecto(ClienteProspectoCreateRequest request);
    ClienteProspectoDetalleResponse actualizar(Long id, ClienteProspectoUpdateRequest request);
    ClasificacionResponse clasificar(Long id, ClasificacionRequest request);
}
