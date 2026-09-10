package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.*;

public record ToleranciaResponse(Long id, CodigoEtapa codigoEtapa, UnidadTolerancia unidad, Integer minutos,
    boolean aplica, boolean activo, Long version) {
}
