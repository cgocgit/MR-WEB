package mx.com.mesaregia.clientes.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ClienteProspectoCreateRequest(
        @NotBlank @Size(max = 150) String nombres,
        @Size(max = 150) String apellidos,
        List<@Valid ContactoCreateRequest> contactos) {
}
