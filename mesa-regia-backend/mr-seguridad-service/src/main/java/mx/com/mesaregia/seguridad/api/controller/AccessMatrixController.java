package mx.com.mesaregia.seguridad.api.controller;

import lombok.RequiredArgsConstructor;
import mx.com.mesaregia.seguridad.api.response.MatrizAccesoItemResponse;
import mx.com.mesaregia.seguridad.application.service.AccessMatrixService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/matriz-acceso")
@RequiredArgsConstructor
public class AccessMatrixController {
  private final AccessMatrixService service;

  @GetMapping
  @PreAuthorize("hasAuthority('matriz.consultar')")
  public List<MatrizAccesoItemResponse> consultar(@RequestParam(required = false) Long idRol,
      @RequestParam(required = false) String modulo, @RequestParam(required = false) String permiso) {
    return service.consultar(idRol, modulo, permiso);
  }
}
