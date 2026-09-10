package mx.com.mesaregia.cotizaciones.scheduler;

import mx.com.mesaregia.cotizaciones.application.service.CotizacionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CotizacionExpirationJob {
  private final CotizacionService s;

  public CotizacionExpirationJob(CotizacionService s) {
    this.s = s;
  }

  @Scheduled(cron = "${mesa-regia.cotizaciones.expiration-cron}")
  public void ejecutar() {
    s.vencerElegibles();
  }
}