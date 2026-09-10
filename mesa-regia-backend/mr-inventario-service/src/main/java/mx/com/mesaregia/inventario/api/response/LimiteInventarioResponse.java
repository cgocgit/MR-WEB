package mx.com.mesaregia.inventario.api.response;

import java.time.LocalDateTime;

public record LimiteInventarioResponse(Long id, Long idExistencia, Long idProducto, Integer minimo, Integer maximo,
    Long idUsuarioModificacionExterno, LocalDateTime actualizadoEn, Long version) {
}
