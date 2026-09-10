package mx.com.mesaregia.pagos.exception;

public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String m) {
    super(m);
  }
}