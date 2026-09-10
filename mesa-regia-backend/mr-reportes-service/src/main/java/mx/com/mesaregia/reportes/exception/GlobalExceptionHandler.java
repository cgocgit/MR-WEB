package mx.com.mesaregia.reportes.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage()).toList();
        return response(HttpStatus.BAD_REQUEST, "La solicitud contiene datos inválidos", request, details);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, ReporteValidationException.class})
    ResponseEntity<ApiError> handleBadRequest(Exception ex, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, ex.getMessage() == null ? "Solicitud inválida" : ex.getMessage(), request, List.of());
    }

    @ExceptionHandler(DependenciaNoDisponibleException.class)
    ResponseEntity<ApiError> handleUnavailable(DependenciaNoDisponibleException ex, HttpServletRequest request) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request, List.of());
    }

    @ExceptionHandler(ReporteExportException.class)
    ResponseEntity<ApiError> handleExport(ReporteExportException ex, HttpServletRequest request) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "No fue posible generar el archivo solicitado", request, List.of());
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String message, HttpServletRequest request, List<String> details) {
        ApiError body = new ApiError(OffsetDateTime.now(), status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), MDC.get("correlationId"), details);
        return ResponseEntity.status(status).body(body);
    }
}
