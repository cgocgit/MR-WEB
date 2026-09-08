package mx.com.mesaregia.seguridad.api.response;
public record RolResponse(Long id,String codigo,String nombre,String descripcion,boolean activo,Long version,long usuariosAsociados){}
