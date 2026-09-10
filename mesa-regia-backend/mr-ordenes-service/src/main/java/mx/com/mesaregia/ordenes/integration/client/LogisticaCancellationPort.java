package mx.com.mesaregia.ordenes.integration.client;

public interface LogisticaCancellationPort {
  void cancelarOrden(Long idOrden, String motivo, String correlationId);
}