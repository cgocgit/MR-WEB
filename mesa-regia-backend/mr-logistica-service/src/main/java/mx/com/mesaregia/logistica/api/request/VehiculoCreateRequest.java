package mx.com.mesaregia.logistica.api.request;

import jakarta.validation.constraints.*;

public record VehiculoCreateRequest(@NotBlank @Size(max = 20) String placa) {
}
