package mx.com.mesaregia.cotizaciones.integration.dto;
import java.math.BigDecimal;
public record PaqueteComponenteContext(String tipo,Long idConcepto,String codigo,String nombre,BigDecimal cantidad,Integer orden,boolean activo) {}
