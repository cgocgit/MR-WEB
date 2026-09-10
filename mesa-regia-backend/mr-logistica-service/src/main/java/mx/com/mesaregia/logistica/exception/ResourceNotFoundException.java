package mx.com.mesaregia.logistica.exception;

public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String m) {
    super(m);
  }
}
