package mx.com.mesaregia.inventario.application.service.impl;
import mx.com.mesaregia.inventario.application.service.LimiteInventarioService; import mx.com.mesaregia.inventario.api.request.LimiteInventarioRequest; import mx.com.mesaregia.inventario.api.response.LimiteInventarioResponse;
import mx.com.mesaregia.inventario.domain.entity.LimiteInventario; import mx.com.mesaregia.inventario.exception.*; import mx.com.mesaregia.inventario.repository.LimiteInventarioRepository; import org.springframework.stereotype.Service; import java.util.Objects; import org.springframework.transaction.annotation.Transactional;
@Service
public class LimiteInventarioServiceImpl implements LimiteInventarioService {
 private final InventorySupport support; private final LimiteInventarioRepository repo; public LimiteInventarioServiceImpl(InventorySupport s,LimiteInventarioRepository r){support=s;repo=r;}
 @Override @Transactional public LimiteInventarioResponse configurar(Long producto, Long almacen, LimiteInventarioRequest q){ if(q.maximo()<q.minimo()) throw new BusinessRuleException("El máximo debe ser mayor o igual al mínimo"); var e=support.existencia(almacen,producto); var l=repo.findByExistenciaId(e.getId()).orElse(null);
   if(l==null){ if(q.version()!=null) throw new ConflictException("No existe una configuración previa con la versión indicada"); l=new LimiteInventario(); l.setExistencia(e); }
   else if(q.version()==null || !Objects.equals(q.version(),l.getVersion())) throw new ConflictException("La configuración fue modificada por otro proceso");
   l.setMinimo(q.minimo());l.setMaximo(q.maximo());l.setIdUsuarioModificacionExterno(q.idUsuarioExterno()); l=repo.saveAndFlush(l); return new LimiteInventarioResponse(l.getId(),e.getId(),producto,l.getMinimo(),l.getMaximo(),l.getIdUsuarioModificacionExterno(),l.getActualizadoEn(),l.getVersion()); }
}
