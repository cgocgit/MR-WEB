package mx.com.mesaregia.inventario.application.service;
import mx.com.mesaregia.inventario.api.response.*; import org.springframework.data.domain.Pageable;
public interface ExistenciaQueryService { PageResponse<ExistenciaResponse> buscar(Long idAlmacen, Pageable pageable); ExistenciaDetalleResponse detalleProducto(Long idProducto, Long idAlmacen); }