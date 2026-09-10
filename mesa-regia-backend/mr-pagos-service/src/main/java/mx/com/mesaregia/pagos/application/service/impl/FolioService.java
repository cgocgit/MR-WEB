package mx.com.mesaregia.pagos.application.service.impl;

import org.springframework.stereotype.Component;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class FolioService {
  private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

  public String generar(String prefijo) {
    return prefijo + "-" + LocalDateTime.now().format(F) + "-"
        + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
  }
}
