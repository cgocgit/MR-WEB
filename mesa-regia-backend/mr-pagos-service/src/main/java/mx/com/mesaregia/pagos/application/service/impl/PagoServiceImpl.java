package mx.com.mesaregia.pagos.application.service.impl;

import mx.com.mesaregia.pagos.api.request.PagoCreateRequest;
import mx.com.mesaregia.pagos.api.response.PagoRegistroResponse;
import mx.com.mesaregia.pagos.application.service.PagoService;
import mx.com.mesaregia.pagos.exception.*;
import mx.com.mesaregia.pagos.repository.PagoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class PagoServiceImpl implements PagoService {
  private final PagoRepository pagos;
  private final CuentaCobroProvisioningService provisioning;
  private final PagoWriteService writer;
  private final PagoQuerySupport query;

  public PagoServiceImpl(PagoRepository p, CuentaCobroProvisioningService cp, PagoWriteService w, PagoQuerySupport q) {
    pagos = p;
    provisioning = cp;
    writer = w;
    query = q;
  }

  @Override
  public PagoRegistroResponse registrar(String key, PagoCreateRequest r) {
    validarKey(key);
    if (r.comprobanteReferencia() != null && !r.comprobanteReferencia().isBlank())
      throw new BusinessRuleException(
          "El comprobante es funcionalmente opcional, pero su referencia aún no puede persistirse en el DDL aprobado de mr_pagos");
    var prev = pagos.findByClaveOperacion(key);
    if (prev.isPresent())
      return query.pago(prev.get().getId(), true, false);
    var cuenta = provisioning.obtenerOCrear(r.idCotizacion(), r.idCotizacionVersion());
    try {
      var x = writer.registrar(cuenta.getId(), key, r);
      return query.pago(x.idPago(), x.idempotente(), x.eventoGenerado());
    } catch (DataIntegrityViolationException ex) {
      var p = pagos.findByClaveOperacion(key).orElseThrow(() -> ex);
      return query.pago(p.getId(), true, false);
    }
  }

  private void validarKey(String k) {
    if (k == null || k.isBlank())
      throw new BusinessRuleException("Idempotency-Key es obligatorio");
    if (k.length() > 120)
      throw new BusinessRuleException("Idempotency-Key no puede exceder 120 caracteres");
  }
}
