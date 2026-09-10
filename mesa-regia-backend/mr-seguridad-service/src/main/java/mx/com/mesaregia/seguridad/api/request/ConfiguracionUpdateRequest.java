package mx.com.mesaregia.seguridad.api.request;

import jakarta.validation.constraints.*;

public record ConfiguracionUpdateRequest(String valor, @NotNull Long version) {
}
