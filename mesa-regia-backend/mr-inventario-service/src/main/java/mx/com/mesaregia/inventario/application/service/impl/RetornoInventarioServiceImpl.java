package mx.com.mesaregia.inventario.application.service.impl;

import mx.com.mesaregia.inventario.api.request.RetornoInventarioRequest;
import mx.com.mesaregia.inventario.api.response.MovimientoResponse;
import mx.com.mesaregia.inventario.api.response.OperacionInventarioResponse;
import mx.com.mesaregia.inventario.application.service.RetornoInventarioService;
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
public class RetornoInventarioServiceImpl implements RetornoInventarioService {
    private final InventorySupport support;
    private final ReservaRepository reservaRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public RetornoInventarioServiceImpl(
            InventorySupport support,
            ReservaRepository reservaRepository,
            MovimientoInventarioRepository movimientoRepository) {
        this.support = support;
        this.reservaRepository = reservaRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Override
    @Transactional
    public OperacionInventarioResponse registrar(String idempotencyKey, RetornoInventarioRequest request) {
        var reserva = reservaForUpdate(request.idOrdenExterno());
        if (reserva.getEstado() != EstadoReserva.ACTIVA) {
            throw new ConflictException("Solo una reserva ACTIVA admite retornos");
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
            long retornos = movimientoRepository.sumCantidad(
                    request.idOrdenExterno(), detalle.getExistencia().getId(), OrigenOperacion.RETORNO_ORDEN);
            int retornable = Math.toIntExact(salidas - retornos);
            if (item.cantidad() > retornable) {
                throw new BusinessRuleException("El retorno supera la cantidad efectivamente salida pendiente");
            }

            String operacion = support.operationKey(
                    idempotencyKey, "RETORNO|" + request.idOrdenExterno() + "|" + item.idProducto());
            var existente = movimientoRepository.findByClaveOperacion(operacion);
            if (existente.isPresent()) {
                movimientos.add(InventarioMapper.movimiento(existente.get()));
                continue;
            }

            // La existencia física permanece como cantidad registrada. Salida/retorno cambian
            // la trazabilidad y el compromiso de reserva, evitando una doble afectación.
            var existencia = detalle.getExistencia();
            int fisica = existencia.getExistenciaFisica();
            var movimiento = support.movimiento(
                    existencia,
                    TipoMovimiento.ENTRADA,
                    OrigenOperacion.RETORNO_ORDEN,
                    item.cantidad(),
                    fisica,
                    fisica,
                    request.idOrdenExterno(),
                    null,
                    "Retorno asociado a Orden",
                    request.comentario(),
                    request.idUsuarioExterno(),
                    operacion);
            movimientos.add(InventarioMapper.movimiento(movimiento));
        }

        if (request.liberarReserva()) {
            reserva.setEstado(EstadoReserva.LIBERADA);
            reserva.setIdUsuarioModificacionExterno(request.idUsuarioExterno());
            reservaRepository.saveAndFlush(reserva);
        }

        int pendienteRetorno = calcularPendienteRetorno(reserva);
        return new OperacionInventarioResponse(
                request.idOrdenExterno(), reserva.getEstado().name(), pendienteRetorno, movimientos);
    }

    private int calcularPendienteRetorno(Reserva reserva) {
        return reserva.getDetalles().stream().mapToInt(detalle -> {
            long salidas = movimientoRepository.sumCantidad(
                    reserva.getIdOrdenExterno(), detalle.getExistencia().getId(), OrigenOperacion.SALIDA_ORDEN);
            long retornos = movimientoRepository.sumCantidad(
                    reserva.getIdOrdenExterno(), detalle.getExistencia().getId(), OrigenOperacion.RETORNO_ORDEN);
            return Math.max(0, Math.toIntExact(salidas - retornos));
        }).sum();
    }

    private Reserva reservaForUpdate(Long idOrdenExterno) {
        return reservaRepository.findByOrdenForUpdate(idOrdenExterno).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada para la Orden"));
    }
}
