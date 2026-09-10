package mx.com.mesaregia.reportes.exception;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiError(
    OffsetDateTime timestamp,
    int status,
    String error,
    String message,
    String path,
    String correlationId,
    List<String> details) {
}
