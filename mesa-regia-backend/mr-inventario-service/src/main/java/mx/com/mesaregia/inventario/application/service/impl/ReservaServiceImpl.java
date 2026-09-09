package mx.com.mesaregia.inventario.application.service.impl;

import mx.com.mesaregia.inventario.api.request.ReservaCrearRequest;
import mx.com.mesaregia.inventario.api.request.ReservaLiberarRequest;
import mx.com.mesaregia.inventario.api.response.ReservaResponse;
import mx.com.mesaregia.inventario.application.service.ReservaQueryService;
import mx.com.mesaregia.inventario.application.service.ReservaService;
import mx.com.mesaregia.inventario.domain.entity.Reserva;
import mx.com.mesaregia.inventario.domain.entity.ReservaDetalle;
import mx.com.mesaregia.inventario.domain.enums.EstadoReserva;
import mx.com.mesaregia.inventario.exception.BusinessRuleException;
import mx.com.mesaregia.inventario.exception.ConflictException;
import mx.com.mesaregia.inventario.exception.ResourceNotFoundException;
import mx.com.mesaregia.inventario.repository.ReservaDetalleRepository;
import mx.com.mesaregia.inventario.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
public class ReservaServiceImpl implements ReservaService {
    private final ReservaRepository reservaRepository;
    private final ReservaDetalleRepository detalleRepository;
    private final InventorySupport support;
    private final ReservaQueryService queryService;

    public ReservaServiceImpl(
            ReservaRepository reservaRepository,
            ReservaDetalleRepository detalleRepository,
            InventorySupport support,
            ReservaQueryService queryService) {
        this.reservaRepository = reservaRepository;
        this.detalleRepository = detalleRepository;
        this.support = support;
        this.queryService = queryService;
    }

    @Override
    @Transactional
    public ReservaResponse crearConfirmada(String idempotencyKey, ReservaCrearRequest request) {
        if (request.fechaFin().isBefore(request.fechaInicio())) {
            throw new BusinessRuleException("La fecha fin no puede ser anterior a la fecha inicio");
        }

        // El DDL vigente no posee una clave de idempotencia en reserva; la Orden externa
        // se utiliza como identidad funcional del comando hasta aprobar una restricción UNIQUE.
        var existing = reservaRepository.findFirstByIdOrdenExternoOrderByIdDesc(request.idOrdenExterno());
        if (existing.isPresent()) {
            return queryService.obtenerPorOrden(request.idOrdenExterno());
        }

        var reserva = new Reserva();
        reserva.setFolio(support.folio("RES"));
        reserva.setIdOrdenExterno(request.idOrdenExterno());
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaInicio(request.fechaInicio());
        reserva.setFechaFin(request.fechaFin());
        reserva.setIdUsuarioCreacionExterno(request.idUsuarioExterno());
        reserva = reservaRepository.saveAndFlush(reserva);

        var seen = new HashSet<String>();
        for (var item : request.detalles()) {
            String key = item.idAlmacen() + "|" + item.idProducto();
            if (!seen.add(key)) {
                throw new BusinessRuleException("No se permiten productos duplicados en la reserva");
            }

            var existencia = support.existencia(item.idAlmacen(), item.idProducto());
            int reservado = support.reservada(existencia.getId(), request.fechaInicio(), request.fechaFin());
            if (existencia.getExistenciaFisica() - reservado < item.cantidad()) {
                throw new ConflictException("Disponibilidad insuficiente para producto " + item.idProducto());
            }

            var detalle = new ReservaDetalle();
            detalle.setReserva(reserva);
            detalle.setExistencia(existencia);
            detalle.setCantidadReservada(item.cantidad());
            detalleRepository.save(detalle);
        }
        detalleRepository.flush();
        return queryService.obtenerPorOrden(request.idOrdenExterno());
    }

    @Override
    @Transactional
    public ReservaResponse activar(Long idOrdenExterno, Long idUsuarioExterno) {
        var reserva = reservaForUpdate(idOrdenExterno);
        if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
            reserva.setEstado(EstadoReserva.ACTIVA);
        } else if (reserva.getEstado() != EstadoReserva.ACTIVA) {
            throw new ConflictException("La reserva no puede activarse desde " + reserva.getEstado());
        }
        reserva.setIdUsuarioModificacionExterno(idUsuarioExterno);
        reservaRepository.saveAndFlush(reserva);
        return queryService.obtenerPorOrden(idOrdenExterno);
    }

    @Override
    @Transactional
    public ReservaResponse liberarPorOrden(Long idOrdenExterno, ReservaLiberarRequest request) {
        var reserva = reservaForUpdate(idOrdenExterno);
        if (reserva.getEstado() == EstadoReserva.LIBERADA || reserva.getEstado() == EstadoReserva.CANCELADA) {
            return queryService.obtenerPorOrden(idOrdenExterno);
        }

        reserva.setEstado(request.cancelacion() ? EstadoReserva.CANCELADA : EstadoReserva.LIBERADA);
        reserva.setMotivoCancelacion(request.cancelacion() ? request.motivo() : null);
        reserva.setIdUsuarioModificacionExterno(request.idUsuarioExterno());
        reservaRepository.saveAndFlush(reserva);
        return queryService.obtenerPorOrden(idOrdenExterno);
    }

    private Reserva reservaForUpdate(Long idOrdenExterno) {
        return reservaRepository.findByOrdenForUpdate(idOrdenExterno).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada para la Orden"));
    }
}
