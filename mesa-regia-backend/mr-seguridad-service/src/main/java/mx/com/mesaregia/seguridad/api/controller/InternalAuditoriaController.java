package mx.com.mesaregia.seguridad.api.controller;

import jakarta.validation.Valid;
import mx.com.mesaregia.seguridad.api.request.InternalAuditEventRequest;
import mx.com.mesaregia.seguridad.application.service.InternalAuditService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/auditoria")
public class InternalAuditoriaController {
  private final InternalAuditService service;

  public InternalAuditoriaController(InternalAuditService s) {
    service = s;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.ACCEPTED)
  @PreAuthorize("hasAuthority('ROLE_INTERNAL_SERVICE')")
  public void registrar(@Valid @RequestBody InternalAuditEventRequest r) {
    service.registrar(r);
  }
}
