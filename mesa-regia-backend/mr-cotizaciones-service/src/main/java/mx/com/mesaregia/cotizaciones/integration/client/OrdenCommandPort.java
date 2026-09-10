package mx.com.mesaregia.cotizaciones.integration.client;
import mx.com.mesaregia.cotizaciones.integration.dto.OrdenResultado; import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
public interface OrdenCommandPort {
 OrdenResultado generar(String idempotencyKey,OrdenSolicitud solicitud);
 record OrdenSolicitud(Long idCotizacion,Long idCotizacionVersion,Long idClienteProspecto,String tipoCompromiso,String clienteSnapshot,String contactoSnapshot,String eventoSnapshot,LocalDateTime fechaHoraEventoSnapshot,String domicilioEventoSnapshot,String observaciones,String referenciaPago,String referenciaReserva,List<Detalle> detalles){}
 record Detalle(String claveTemporal,String clavePadreTemporal,String tipoConcepto,Long idConcepto,String codigo,String nombre,BigDecimal cantidad,Integer orden){}
}
