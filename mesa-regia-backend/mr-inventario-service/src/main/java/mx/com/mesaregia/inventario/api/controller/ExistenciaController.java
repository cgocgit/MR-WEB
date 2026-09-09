package mx.com.mesaregia.inventario.api.controller;
import mx.com.mesaregia.inventario.application.service.ExistenciaQueryService; import mx.com.mesaregia.inventario.api.response.*; import org.springframework.data.domain.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;
@RestController @RequestMapping("/api/v1/inventario/existencias") public class ExistenciaController { private final ExistenciaQueryService s; public ExistenciaController(ExistenciaQueryService s){this.s=s;}
 @GetMapping @PreAuthorize("hasAuthority('inventario.consultar')") public PageResponse<ExistenciaResponse> buscar(@RequestParam Long idAlmacen,@PageableDefault(size=20,sort="id") Pageable p){return s.buscar(idAlmacen,p);} 
 @GetMapping("/productos/{idProducto}") @PreAuthorize("hasAuthority('inventario.consultar')") public ExistenciaDetalleResponse detalle(@PathVariable Long idProducto,@RequestParam Long idAlmacen){return s.detalleProducto(idProducto,idAlmacen);} }
