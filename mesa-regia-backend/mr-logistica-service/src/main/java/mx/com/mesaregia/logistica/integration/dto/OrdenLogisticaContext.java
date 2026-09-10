package mx.com.mesaregia.logistica.integration.dto;

import mx.com.mesaregia.logistica.domain.enums.CodigoEtapa;
import java.time.LocalDateTime;
import java.util.Set;

public record OrdenLogisticaContext(Long idOrden, String folio, String estado, Long version, String domicilioSnapshot,
    LocalDateTime fechaHoraEvento, Set<CodigoEtapa> fasesAplicables) {
}
