package mx.com.mesaregia.seguridad.api.response;

public record MatrizAccesoItemResponse(Long idRol, String rolCodigo, String rolNombre, Long idPermiso,
    String permisoCodigo, String modulo, String accion, String alcance) {
}