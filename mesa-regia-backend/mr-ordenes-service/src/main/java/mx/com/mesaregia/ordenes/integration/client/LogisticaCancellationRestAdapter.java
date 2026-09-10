package mx.com.mesaregia.ordenes.integration.client;
import mx.com.mesaregia.ordenes.exception.IntegrationUnavailableException; import org.springframework.stereotype.Component; import org.springframework.web.client.*;
@Component public class LogisticaCancellationRestAdapter implements LogisticaCancellationPort {private final RestClient client;public LogisticaCancellationRestAdapter(InternalRestClientFactory f){client=f.create(System.getenv().getOrDefault("MR_LOGISTICA_BASE_URL","http://localhost:8088"));}
 @Override public void cancelarOrden(Long idOrden,String motivo,String corr){try{client.post().uri("/internal/v1/logistica/ordenes/{id}/cancelar",idOrden).retrieve().toBodilessEntity();}catch(HttpClientErrorException.NotFound e){return;}catch(ResourceAccessException|HttpServerErrorException e){throw new IntegrationUnavailableException("Logística no disponible para cancelar Orden");}}
}
