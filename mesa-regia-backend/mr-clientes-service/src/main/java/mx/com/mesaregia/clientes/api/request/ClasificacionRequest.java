package mx.com.mesaregia.clientes.api.request;

import jakarta.validation.constraints.NotNull;
import mx.com.mesaregia.clientes.domain.enums.EstadoClienteProspecto;

public record ClasificacionRequest(
        @NotNull EstadoClienteProspecto estadoDestino,
        @NotNull Long version) {
}
