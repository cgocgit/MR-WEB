package mx.com.mesaregia.clientes.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mx.com.mesaregia.clientes.domain.enums.TipoMedioContacto;

public record ContactoCreateRequest(
        @NotNull TipoMedioContacto tipoMedioContacto,
        @NotBlank @Size(max = 200) String medioContacto,
        boolean esPrincipal) {
}
