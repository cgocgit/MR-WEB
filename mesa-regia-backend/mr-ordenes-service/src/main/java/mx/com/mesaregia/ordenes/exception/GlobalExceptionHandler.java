package mx.com.mesaregia.ordenes.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import mx.com.mesaregia.ordenes.config.CorrelationIdFilter;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import java.time.OffsetDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> nf(ResourceNotFoundException e, HttpServletRequest r) {
    return b(404, "Not Found", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler({ ConflictException.class, ObjectOptimisticLockingFailureException.class })
  ResponseEntity<ApiError> cf(Exception e, HttpServletRequest r) {
    return b(409, "Conflict",
        e instanceof ConflictException ? e.getMessage() : "El registro cambió; recargue e intente nuevamente", r,
        Map.of());
  }

  @ExceptionHandler(BusinessRuleException.class)
  ResponseEntity<ApiError> br(BusinessRuleException e, HttpServletRequest r) {
    return b(422, "Unprocessable Entity", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(IntegrationUnavailableException.class)
  ResponseEntity<ApiError> iu(IntegrationUnavailableException e, HttpServletRequest r) {
    return b(503, "Service Unavailable", e.getMessage(), r, Map.of());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<ApiError> di(DataIntegrityViolationException e, HttpServletRequest r) {
    return b(409, "Conflict", "La operación entra en conflicto con datos existentes", r, Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> inv(MethodArgumentNotValidException e, HttpServletRequest r) {
    var m = new LinkedHashMap<String, String>();
    e.getBindingResult().getFieldErrors().forEach(x -> m.putIfAbsent(x.getField(), x.getDefaultMessage()));
    return b(400, "Bad Request", "Solicitud inválida", r, m);
  }

  @ExceptionHandler({ ConstraintViolationException.class, HandlerMethodValidationException.class })
  ResponseEntity<ApiError> val(Exception e, HttpServletRequest r) {
    return b(400, "Bad Request", "Solicitud inválida", r, Map.of());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> oth(Exception e, HttpServletRequest r) {
    return b(500, "Internal Server Error", "Ocurrió un error inesperado", r, Map.of());
  }

  private ResponseEntity<ApiError> b(int s, String er, String msg, HttpServletRequest r, Map<String, String> f) {
    return ResponseEntity.status(s).body(
        new ApiError(OffsetDateTime.now(), s, er, msg, r.getRequestURI(), MDC.get(CorrelationIdFilter.MDC_KEY), f));
  }
}
