package mx.com.mesaregia.seguridad.exception;

import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest r) {
    return response(HttpStatus.BAD_REQUEST, "La solicitud contiene datos inválidos", r,
        ex.getBindingResult().getFieldErrors().stream().map(e -> e.getField() + ": " + e.getDefaultMessage()).toList());
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException ex, HttpServletRequest r) {
    return response(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud no puede interpretarse", r, List.of());
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> notFound(ResourceNotFoundException ex, HttpServletRequest r) {
    return response(HttpStatus.NOT_FOUND, ex.getMessage(), r, List.of());
  }

  @ExceptionHandler(BusinessRuleException.class)
  ResponseEntity<ApiError> rule(BusinessRuleException ex, HttpServletRequest r) {
    return response(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), r, List.of());
  }

  @ExceptionHandler({ ConflictException.class, ObjectOptimisticLockingFailureException.class,
      OptimisticLockException.class, DataIntegrityViolationException.class })
  ResponseEntity<ApiError> conflict(Exception ex, HttpServletRequest r) {
    return response(HttpStatus.CONFLICT, ex instanceof ConflictException ? ex.getMessage()
        : "La operación entra en conflicto con el estado actual de los datos", r, List.of());
  }

  private ResponseEntity<ApiError> response(HttpStatus s, String m, HttpServletRequest r, List<String> d) {
    return ResponseEntity.status(s).body(new ApiError(OffsetDateTime.now(), s.value(), s.getReasonPhrase(), m,
        r.getRequestURI(), MDC.get("correlationId"), d));
  }
}
