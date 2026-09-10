package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.EtapaResponse;
import java.util.List;

public interface EtapaLogisticaService {
  List<EtapaResponse> listarPorProgramacion(Long id);

  EtapaResponse iniciar(Long id, EtapaIniciarRequest r);

  EtapaResponse avance(Long id, EtapaAvanceRequest r);

  EtapaResponse evidencias(Long id, EtapaEvidenciaRequest r);

  EtapaResponse confirmar(Long id, EtapaConfirmarRequest r);
}
