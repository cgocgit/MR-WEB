package mx.com.mesaregia.logistica.api.response;

import mx.com.mesaregia.logistica.domain.enums.PerfilReportante;

public record TipoIncidenciaResponse(Long id, String codigo, String nombre, PerfilReportante perfilReportante) {
}
