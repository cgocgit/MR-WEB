package mx.com.mesaregia.inventario.integration.dto;

import java.time.LocalDate;

public record LogisticaInventarioDto(
        Long idOrden,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String estado) {}
