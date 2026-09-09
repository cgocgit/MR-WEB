package mx.com.mesaregia.inventario.application.service.impl;

import mx.com.mesaregia.inventario.api.request.SalidaInventarioRequest;
import mx.com.mesaregia.inventario.api.response.MovimientoResponse;
import mx.com.mesaregia.inventario.api.response.OperacionInventarioResponse;
import mx.com.mesaregia.inventario.application.service.SalidaInventarioService;
import mx.com.mesaregia.inventario.domain.entity.Reserva;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import mx.com.mesaregia.inventario.domain.enums.OrigenOperacion;
import mx.com.mesaregia.inventario.domain.enums.TipoMovimiento;
import mx.com.mesaregia.inventario.exception.BusinessRuleException;
import mx.com.mesaregia.inventario.exception.ConflictException;
import mx.com.mesaregia.inventario.exception.ResourceNotFoundException;
import mx.com.mesaregia.inventario.mapper.InventarioMapper;
import mx.com.mesaregia.inventario.repository.MovimientoInventarioRepository;
import mx.com.mesaregia.inventario.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class SalidaInventarioServiceImpl implements SalidaInventarioService {
    private final InventorySupport support;
    private final ReservaRepository reservaRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public SalidaInventarioServiceImpl(
            InventorySupport support,
            ReservaRepository reservaRepository,
            MovimientoInventarioRepository movimientoRepository) {
        this.support = support;
        this.reservaRepository = reservaRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Override
    @Transactional
    public OperacionInventarioResponse registrar(String idempotencyKey, SalidaInventarioRequest request) {
        var reserva = reservaForUpdate(request.idOrdenExterno());
        if (reserva.getEstado() != EstadoReserva.CONFIRMADA && reserva.getEstado() != EstadoReserva.ACTIVA) {
            throw new ConflictException("La reserva no admite nuevas salidas");
        }

        var movimientos = new ArrayList<MovimientoResponse>();
        for (var item : request.items()) {
            var detalle = reserva.getDetalles().stream()
                    .filter(d -> d.getExistencia().getAlmacen().getId().equals(item.idAlmacen())
                            && d.getExistencia().getIdProductoExterno().equals(item.idProducto()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessRuleException("El producto no pertenece a la reserva"));

            long salidas = movimientoRepository.sumCantidad(
                    request.idOrdenExterno(), detalle.getExistencia().getId(), OrigenOperacion.SALIDA_ORDEN);
            int pendiente = detalle.getCantidadReservada() - Math.toIntExact(salidas);
            if (item.cantidad() > pendiente) {
                throw new BusinessRuleException("La salida supera la cantidad reservada pendiente");
            }

            String operacion = support.operationKey(
                    idempotencyKey, "SALIDA|" + request.idOrdenExterno() + "|" + item.idProducto());
            var existente = movimientoRepository.findByClaveOperacion(operacion);
            if (existente.isPresent()) {
                movimientos.add(InventarioMapper.movimiento(existente.get()));
                continue;
            }

            var existencia = detalle.getExistencia();
            int fisica = existencia.getExistenciaFisica();
            var movimiento = support.movimiento(
                    existencia,
                    TipoMovimiento.SALIDA,
                    OrigenOperacion.SALIDA_ORDEN,
                    item.cantidad(),
                    fisica,
                    fisica,
                    request.idOrdenExterno(),
                    null,
                    null,
                    request.comentario(),
                    request.idUsuarioExterno(),
                    operacion);
            movimientos.add(InventarioMapper.movimiento(movimiento));
            reserva.setReferenciaSalida(movimiento.getFolio());
        }

        if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
            reserva.setEstado(EstadoReserva.ACTIVA);
        }
        reserva.setIdUsuarioModificacionExterno(request.idUsuarioExterno());
        reservaRepository.saveAndFlush(reserva);

        int pendienteTotal = calcularPendienteSalida(reserva);
        return new OperacionInventarioResponse(
                request.idOrdenExterno(), reserva.getEstado().name(), pendienteTotal, movimientos);
    }

    private int calcularPendienteSalida(Reserva reserva) {
        return reserva.getDetalles().stream().mapToInt(detalle -> {
            long salidas = movimientoRepository.sumCantidad(
                    reserva.getIdOrdenExterno(), detalle.getExistencia().getId(), OrigenOperacion.SALIDA_ORDEN);
            return Math.max(0, detalle.getCantidadReservada() - Math.toIntExact(salidas));
        }).sum();
    }

    private Reserva reservaForUpdate(Long idOrdenExterno) {
        return reservaRepository.findByOrdenForUpdate(idOrdenExterno).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada para la Orden"));
    }
}
