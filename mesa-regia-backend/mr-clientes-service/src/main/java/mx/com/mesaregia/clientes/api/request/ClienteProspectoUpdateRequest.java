package mx.com.mesaregia.clientes.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClienteProspectoUpdateRequest(
    @NotBlank @Size(max = 150) String nombres,
    @Size(max = 150) String apellidos,
    @NotNull Long version) {
}
