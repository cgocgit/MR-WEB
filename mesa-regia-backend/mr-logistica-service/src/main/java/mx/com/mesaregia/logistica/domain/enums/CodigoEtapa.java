package mx.com.mesaregia.logistica.domain.enums;

public enum CodigoEtapa {
  RECEPCION, PLANEACION, PREPARACION, CARGA_DESPACHO, TRASLADO_SITIO, ENTREGA, MONTAJE, EJECUCION, DESMONTAJE,
  RECOLECCION, TRASLADO_RETORNO, ENTREGA_ALMACEN, INSPECCION, LIMPIEZA_REACONDICIONAMIENTO, REINGRESO_INVENTARIO,
  CIERRE;

  public boolean esTraslado() {
    return this == TRASLADO_SITIO || this == TRASLADO_RETORNO;
  }

  public boolean esInventario() {
    return this == PREPARACION || this == ENTREGA_ALMACEN || this == INSPECCION || this == LIMPIEZA_REACONDICIONAMIENTO
        || this == REINGRESO_INVENTARIO;
  }

  public boolean esSistema() {
    return this == RECEPCION || this == PLANEACION;
  }

  public boolean esChofer() {
    return this == CARGA_DESPACHO || esTraslado();
  }

  public boolean esRepresentante() {
    return this == ENTREGA || this == MONTAJE || this == EJECUCION || this == DESMONTAJE || this == RECOLECCION
        || this == CIERRE;
  }
}
