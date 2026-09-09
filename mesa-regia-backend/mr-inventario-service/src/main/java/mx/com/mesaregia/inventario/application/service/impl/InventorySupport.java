package mx.com.mesaregia.inventario.application.service.impl;

import mx.com.mesaregia.inventario.domain.entity.*;
import mx.com.mesaregia.inventario.domain.enums.*;
import mx.com.mesaregia.inventario.exception.*;
import mx.com.mesaregia.inventario.repository.*;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;

@Component
public class InventorySupport {
    public static final Set<EstadoReserva> VIGENTES = Set.of(EstadoReserva.CONFIRMADA, EstadoReserva.ACTIVA);
    private final AlmacenRepository almacenRepository; private final ExistenciaRepository existenciaRepository;
    private final ReservaDetalleRepository reservaDetalleRepository; private final MovimientoInventarioRepository movimientoRepository;
    public InventorySupport(AlmacenRepository a, ExistenciaRepository e, ReservaDetalleRepository rd, MovimientoInventarioRepository m){this.almacenRepository=a;this.existenciaRepository=e;this.reservaDetalleRepository=rd;this.movimientoRepository=m;}
    public Almacen almacen(Long id){ return almacenRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado")); }
    public Existencia existencia(Long almacen, Long producto){ return existenciaRepository.findByAlmacenIdAndIdProductoExterno(almacen,producto).orElseThrow(() -> new ResourceNotFoundException("Existencia no encontrada para el producto")); }
    public Existencia existenciaForUpdate(Long almacen, Long producto){ return existenciaRepository.findForUpdate(almacen,producto).orElseThrow(() -> new ResourceNotFoundException("Existencia no encontrada para el producto")); }
    public int reservada(Long idExistencia, LocalDate inicio, LocalDate fin){ Long v=reservaDetalleRepository.sumReservadaEnPeriodo(idExistencia,VIGENTES,inicio,fin); return v==null?0:Math.toIntExact(v); }
    public String folio(String prefijo){ return prefijo+"-"+LocalDateTime.now().toString().replaceAll("[-:T.]","").substring(0,14)+"-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(); }
    public String operationKey(String key, String scope){
        if(key==null || key.isBlank()) throw new BusinessRuleException("Idempotency-Key es obligatorio");
        try { var d=MessageDigest.getInstance("SHA-256").digest((key.trim()+"|"+scope).getBytes(StandardCharsets.UTF_8)); return HexFormat.of().formatHex(d); }
        catch(Exception e){ throw new IllegalStateException(e); }
    }
    public MovimientoInventario movimiento(Existencia e, TipoMovimiento tipo, OrigenOperacion origen, int cantidad, int anterior, int resultante,
                                    Long orden, CorteFisico corte, String motivo, String comentario, Long usuario, String clave){
        var m=new MovimientoInventario(); m.setFolio(folio("MOV")); m.setExistencia(e); m.setTipoMovimiento(tipo); m.setOrigenOperacion(origen);
        m.setCantidad(cantidad); m.setExistenciaAnterior(anterior); m.setExistenciaResultante(resultante); m.setIdOrdenExterno(orden); m.setCorteFisico(corte);
        m.setMotivo(motivo); m.setComentario(comentario); m.setIdUsuarioExterno(usuario); m.setClaveOperacion(clave); return movimientoRepository.saveAndFlush(m);
    }
}
