package mx.com.mesaregia.catalogo.api.controller;
import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.application.service.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/internal/v1/catalogo") @PreAuthorize("hasAuthority('ROLE_INTERNAL_SERVICE')")
public class InternalCatalogoController {
 private final ListaPrecioService listas; private final PaqueteService paquetes; private final ProductoService productos; private final ServicioService servicios;
 public InternalCatalogoController(ListaPrecioService l,PaqueteService p,ProductoService pr,ServicioService s){listas=l;paquetes=p;productos=pr;servicios=s;}
 @GetMapping("/listas-precios/{id}") public ListaPrecioConDetallesResponse lista(@PathVariable Long id){return listas.obtenerPrecios(id);}
 @GetMapping("/paquetes/{id}/componentes") public PaqueteDetalleResponse paquete(@PathVariable Long id){return paquetes.obtenerComponentes(id);}
 @GetMapping("/productos/{id}") public ProductoResponse producto(@PathVariable Long id){return productos.obtener(id);}
 @GetMapping("/servicios/{id}") public ServicioResponse servicio(@PathVariable Long id){return servicios.obtener(id);}
}
