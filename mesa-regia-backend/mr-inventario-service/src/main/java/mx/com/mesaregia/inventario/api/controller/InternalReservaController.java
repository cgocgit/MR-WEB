package mx.com.mesaregia.inventario.api.controller;
import jakarta.validation.Valid; import mx.com.mesaregia.inventario.api.request.*; import mx.com.mesaregia.inventario.api.response.ReservaResponse; import mx.com.mesaregia.inventario.application.service.ReservaService; import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty; import org.springframework.http.HttpStatus; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/internal/v1/reservas") @ConditionalOnProperty(prefix="mesaregia.internal-endpoints",name="enabled",havingValue="true") @PreAuthorize("hasAuthority('ROLE_INTERNAL_SERVICE')")
public class InternalReservaController {private final ReservaService s;public InternalReservaController(ReservaService s){this.s=s;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ReservaResponse crear(@RequestHeader("Idempotency-Key")String key,@Valid @RequestBody ReservaCrearRequest r){return s.crearConfirmada(key,r);}
 @PostMapping("/{id}/vincular-orden") public ReservaResponse vincular(@PathVariable Long id,@Valid @RequestBody ReservaVincularOrdenRequest r){return s.vincularOrden(id,r);}
 @PostMapping("/{id}/liberar") public ReservaResponse liberarReserva(@PathVariable Long id,@Valid @RequestBody ReservaLiberarRequest r){return s.liberarPorReserva(id,r);}
 @PostMapping("/ordenes/{idOrden}/liberar") public ReservaResponse liberarOrden(@PathVariable Long idOrden,@Valid @RequestBody ReservaLiberarRequest r){return s.liberarPorOrden(idOrden,r);}
}
