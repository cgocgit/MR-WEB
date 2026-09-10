package mx.com.mesaregia.pagos.api.controller;

import mx.com.mesaregia.pagos.api.response.CuentaCobroResponse;
import mx.com.mesaregia.pagos.application.service.CuentaCobroService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cuentas-cobro")
public class CuentaCobroController {
  private final CuentaCobroService service;

  public CuentaCobroController(CuentaCobroService s) {
    service = s;
  }

  @GetMapping("/cotizaciones/{idCotizacion}/versiones/{idVersion}")
  @PreAuthorize("hasAuthority('pagos.consultar')")
  public CuentaCobroResponse obtener(@PathVariable Long idCotizacion, @PathVariable Long idVersion) {
    return service.obtenerPorCotizacion(idCotizacion, idVersion);
  }
}
