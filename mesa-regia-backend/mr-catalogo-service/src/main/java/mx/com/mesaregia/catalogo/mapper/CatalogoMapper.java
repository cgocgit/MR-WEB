package mx.com.mesaregia.catalogo.mapper;

import mx.com.mesaregia.catalogo.api.response.*;
import mx.com.mesaregia.catalogo.domain.entity.*;
import mx.com.mesaregia.catalogo.domain.enums.TipoComponente;
import mx.com.mesaregia.catalogo.domain.enums.TipoConceptoPrecio;
import org.springframework.stereotype.Component;

@Component
public class CatalogoMapper {

    public CategoriaResponse categoria(Categoria e) {
        return new CategoriaResponse(e.getId(), e.getNombre(), e.getAmbito(), e.isActivo(), e.getActualizadoEn(), e.getVersion());
    }

    public TipoProductoResponse tipoProducto(TipoProducto e) {
        return new TipoProductoResponse(e.getId(), e.getNombre(), e.isActivo(), e.getActualizadoEn(), e.getVersion());
    }

    public ColorResponse color(Color e) {
        if (e == null) return null;
        return new ColorResponse(e.getId(), e.getNombre(), e.isActivo(), e.getActualizadoEn(), e.getVersion());
    }

    public ProductoResponse producto(Producto e) {
        return new ProductoResponse(
                e.getId(), e.getCodigo(), e.getNombre(), e.getDescripcion(),
                categoria(e.getCategoria()), tipoProducto(e.getTipoProducto()), color(e.getColor()),
                e.getUnidadMedida(), e.getPrecioBase(), e.isActivo(),
                e.getCreadoEn(), e.getActualizadoEn(), e.getVersion());
    }

    public ServicioResponse servicio(Servicio e) {
        return new ServicioResponse(
                e.getId(), e.getCodigo(), e.getNombre(), e.getDescripcion(), categoria(e.getCategoria()),
                e.getTipoServicio(), e.getTarifaBase(), e.isActivo(),
                e.getCreadoEn(), e.getActualizadoEn(), e.getVersion());
    }

    public PaqueteResponse paquete(Paquete e, long componentes) {
        return new PaqueteResponse(
                e.getId(), e.getCodigo(), e.getNombre(), e.getDescripcion(), e.isActivo(), componentes,
                e.getCreadoEn(), e.getActualizadoEn(), e.getVersion());
    }

    public PaqueteComponenteResponse componente(PaqueteDetalle e) {
        if (e.getProducto() != null) {
            Producto p = e.getProducto();
            return new PaqueteComponenteResponse(
                    e.getId(), TipoComponente.PRODUCTO, p.getId(), p.getCodigo(), p.getNombre(),
                    e.getCantidad(), e.getOrden(), p.isActivo());
        }
        Servicio s = e.getServicio();
        return new PaqueteComponenteResponse(
                e.getId(), TipoComponente.SERVICIO, s.getId(), s.getCodigo(), s.getNombre(),
                e.getCantidad(), e.getOrden(), s.isActivo());
    }

    public ListaPrecioResponse listaPrecio(ListaPrecio e) {
        return new ListaPrecioResponse(
                e.getId(), e.getCodigo(), e.getNombre(), e.getDescripcion(),
                e.getVigenciaInicio(), e.getVigenciaFin(), e.getPorcentajeAdicionalFueraLista(),
                e.isActivo(), e.getCreadoEn(), e.getActualizadoEn(), e.getVersion());
    }

    public ListaPrecioDetalleResponse precio(ListaPrecioDetalle e) {
        if (e.getProducto() != null) {
            Producto p = e.getProducto();
            return new ListaPrecioDetalleResponse(
                    e.getId(), TipoConceptoPrecio.PRODUCTO, p.getId(), p.getCodigo(), p.getNombre(),
                    e.getPrecio(), e.isActivo(), e.getVersion());
        }
        Paquete p = e.getPaquete();
        return new ListaPrecioDetalleResponse(
                e.getId(), TipoConceptoPrecio.PAQUETE, p.getId(), p.getCodigo(), p.getNombre(),
                e.getPrecio(), e.isActivo(), e.getVersion());
    }
}
