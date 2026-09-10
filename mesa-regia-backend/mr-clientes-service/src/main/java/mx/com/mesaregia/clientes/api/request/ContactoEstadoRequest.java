package mx.com.mesaregia.clientes.api.request;

import jakarta.validation.constraints.NotNull;

public record ContactoEstadoRequest(boolean activo, @NotNull Long version) {
}
