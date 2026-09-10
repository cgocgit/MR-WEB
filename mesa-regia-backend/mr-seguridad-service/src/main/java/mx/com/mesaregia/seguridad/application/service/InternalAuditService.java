package mx.com.mesaregia.seguridad.application.service;
import mx.com.mesaregia.seguridad.api.request.InternalAuditEventRequest;
public interface InternalAuditService { void registrar(InternalAuditEventRequest request); }
