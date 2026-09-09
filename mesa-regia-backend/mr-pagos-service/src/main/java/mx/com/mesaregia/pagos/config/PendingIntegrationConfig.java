package mx.com.mesaregia.pagos.config;
import mx.com.mesaregia.pagos.exception.IntegrationUnavailableException; import mx.com.mesaregia.pagos.integration.client.CotizacionPaymentContextPort; import mx.com.mesaregia.pagos.integration.event.*; import mx.com.mesaregia.pagos.integration.file.FileStoragePort; import org.slf4j.*; import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean; import org.springframework.context.annotation.*;
@Configuration public class PendingIntegrationConfig {
 private static final Logger log=LoggerFactory.getLogger(PendingIntegrationConfig.class);
 @Bean @ConditionalOnMissingBean(CotizacionPaymentContextPort.class) CotizacionPaymentContextPort cotizacionesPending(){return (c,v)->{throw new IntegrationUnavailableException("La integración con mr-cotizaciones-service se conectará en la Etapa 10");};}
 @Bean @ConditionalOnMissingBean(DomainEventPublisher.class) DomainEventPublisher eventPublisher(){return e->log.info("Evento local pendiente de adapter durable: IMPORTE_REQUERIDO_CUBIERTO cuenta={} cotizacion={}",e.idCuentaCobro(),e.idCotizacion());}
 @Bean @ConditionalOnMissingBean(FileStoragePort.class) FileStoragePort fileStoragePending(){return r->{throw new IntegrationUnavailableException("El almacenamiento de comprobantes está pendiente de decisión de persistencia");};}
}
