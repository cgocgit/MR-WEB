package mx.com.mesaregia.inventario.integration.dto;

public record ProductoInventarioDto(
        Long idProducto,
        String codigo,
        String nombre,
        String unidadMedida,
        boolean activo) {}
