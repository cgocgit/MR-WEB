package mx.com.mesaregia.seguridad.application.service.impl;
import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.request.InternalAuditEventRequest;
import mx.com.mesaregia.seguridad.application.service.InternalAuditService;
import mx.com.mesaregia.seguridad.domain.entity.EventoAuditoria;
import mx.com.mesaregia.seguridad.domain.enums.ResultadoAuditoria;
import mx.com.mesaregia.seguridad.repository.EventoAuditoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class InternalAuditServiceImpl implements InternalAuditService {
 private final EventoAuditoriaRepository repo;
 @Override @Transactional public void registrar(InternalAuditEventRequest r){
  var e=new EventoAuditoria(); e.setModulo(r.modulo());e.setAccion(r.accion());e.setTipoRecurso(r.tipoRecurso());e.setIdentificadorRecurso(r.identificadorRecurso());
  e.setResultado(ResultadoAuditoria.EXITOSO);e.setMotivo(r.motivo());e.setDetalle(r.detalle());e.setIdCorrelacion(r.correlationId());repo.save(e);
 }
}
