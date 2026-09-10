package mx.com.mesaregia.clientes.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> notFound(ResourceNotFoundException ex, HttpServletRequest req) {
    return response(HttpStatus.NOT_FOUND, ex.getMessage(), req, List.of());
  }

  @ExceptionHandler({ ConflictException.class, ObjectOptimisticLockingFailureException.class,
      DataIntegrityViolationException.class })
  ResponseEntity<ApiError> conflict(Exception ex, HttpServletRequest req) {
    String msg = ex instanceof ConflictException ? ex.getMessage()
        : "La operación entra en conflicto con el estado actual de los datos";
    return response(HttpStatus.CONFLICT, msg, req, List.of());
  }

  @ExceptionHandler(BusinessRuleException.class)
  ResponseEntity<ApiError> business(BusinessRuleException ex, HttpServletRequest req) {
    return response(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), req, List.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
    var details = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> e.getField() + ": " + e.getDefaultMessage()).toList();
    return response(HttpStatus.BAD_REQUEST, "La solicitud contiene datos inválidos", req, details);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
    return response(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud no puede interpretarse", req, List.of());
  }

  private ResponseEntity<ApiError> response(HttpStatus status, String message, HttpServletRequest req,
      List<String> details) {
    return ResponseEntity.status(status)
        .body(new ApiError(OffsetDateTime.now(), status.value(), status.getReasonPhrase(),
            message, req.getRequestURI(), MDC.get("correlationId"), details));
  }
}
