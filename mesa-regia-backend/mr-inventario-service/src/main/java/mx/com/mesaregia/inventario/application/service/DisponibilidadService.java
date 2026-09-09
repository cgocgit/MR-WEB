package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.response.DisponibilidadResponse; import java.time.LocalDate;
public interface DisponibilidadService { DisponibilidadResponse consultarFutura(Long idProducto, Long idAlmacen, LocalDate inicio, LocalDate fin, Integer cantidad); }