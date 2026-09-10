package mx.com.mesaregia.logistica.integration.dto;

public record InventarioOrdenContext(Long idOrden, String estadoReserva, String estadoRetorno,
    String estadoInspeccion) {
}
