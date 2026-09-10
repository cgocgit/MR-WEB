package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.request.*; import mx.com.mesaregia.inventario.api.response.ReservaResponse;
public interface ReservaService { ReservaResponse crearConfirmada(String idempotencyKey,ReservaCrearRequest request); ReservaResponse vincularOrden(Long idReserva,ReservaVincularOrdenRequest request); ReservaResponse activar(Long idOrden,Long usuario); ReservaResponse liberarPorReserva(Long idReserva,ReservaLiberarRequest request); ReservaResponse liberarPorOrden(Long idOrden,ReservaLiberarRequest request); }
