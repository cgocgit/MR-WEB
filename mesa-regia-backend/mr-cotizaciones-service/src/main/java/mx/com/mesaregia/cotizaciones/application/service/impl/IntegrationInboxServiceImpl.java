package mx.com.mesaregia.cotizaciones.application.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.com.mesaregia.cotizaciones.api.request.ImporteCubiertoEventRequest;
import mx.com.mesaregia.cotizaciones.application.service.IntegrationInboxService;
import mx.com.mesaregia.cotizaciones.domain.entity.IntegrationInbox;
import mx.com.mesaregia.cotizaciones.repository.IntegrationInboxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IntegrationInboxServiceImpl implements IntegrationInboxService {
  private final IntegrationInboxRepository repo;
  private final CotizacionSupport support;
  private final ObjectMapper json;

  public IntegrationInboxServiceImpl(IntegrationInboxRepository r, CotizacionSupport s, ObjectMapper j) {
    repo = r;
    support = s;
    json = j;
  }

  @Override
  @Transactional
  public void importeCubierto(ImporteCubiertoEventRequest r) {
    if (repo.existsByEventId(r.eventId()))
      return;
    support.get(r.idCotizacion());
    support.version(r.idCotizacion(), r.idCotizacionVersion());
    var i = new IntegrationInbox();
    i.setEventId(r.eventId());
    i.setTipo("IMPORTE_REQUERIDO_CUBIERTO");
    i.setOrigen("mr-pagos-service");
    try {
      i.setPayload(json.writeValueAsString(r));
    } catch (Exception e) {
      i.setPayload("{}");
    }
    repo.save(i);
    support.history(r.idCotizacion(), r.idCotizacionVersion(), "IMPORTE_REQUERIDO_CUBIERTO", null, null,
        "Pagos informó cobertura del importe requerido", null);
  }
}
