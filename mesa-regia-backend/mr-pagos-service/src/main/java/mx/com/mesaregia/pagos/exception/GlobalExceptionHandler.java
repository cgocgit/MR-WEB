package mx.com.mesaregia.pagos.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import mx.com.mesaregia.pagos.config.CorrelationIdFilter;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import java.time.OffsetDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> notFound(ResourceNotFoundException e, HttpServletRequest r) {
    return build(404, "Not Found", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(ConflictException.class)
  ResponseEntity<ApiError> conflict(ConflictException e, HttpServletRequest r) {
    return build(409, "Conflict", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(BusinessRuleException.class)
  ResponseEntity<ApiError> business(BusinessRuleException e, HttpServletRequest r) {
    return build(422, "Unprocessable Entity", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(IntegrationUnavailableException.class)
  ResponseEntity<ApiError> integration(IntegrationUnavailableException e, HttpServletRequest r) {
    return build(503, "Service Unavailable", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<ApiError> integrity(DataIntegrityViolationException e, HttpServletRequest r) {
    return build(409, "Conflict", "La operación entra en conflicto con datos existentes", r, Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> invalid(MethodArgumentNotValidException e, HttpServletRequest r) {
    var m = new LinkedHashMap<String, String>();
    e.getBindingResult().getFieldErrors().forEach(x -> m.putIfAbsent(x.getField(), x.getDefaultMessage()));
    return build(400, "Bad Request", "Solicitud inválida", r, m);
  }

  @ExceptionHandler({ ConstraintViolationException.class, HandlerMethodValidationException.class })
  ResponseEntity<ApiError> validation(Exception e, HttpServletRequest r) {
    return build(400, "Bad Request", "Solicitud inválida", r, Map.of());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> other(Exception e, HttpServletRequest r) {
    return build(500, "Internal Server Error", "Ocurrió un error inesperado", r, Map.of());
  }

  private ResponseEntity<ApiError> build(int s, String err, String msg, HttpServletRequest r, Map<String, String> f) {
    String c = MDC.get(CorrelationIdFilter.MDC_KEY);
    return ResponseEntity.status(s).body(new ApiError(OffsetDateTime.now(), s, err, msg, r.getRequestURI(), c, f));
  }
}
