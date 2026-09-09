package mx.com.mesaregia.ordenes.api.request; import jakarta.validation.constraints.*; import mx.com.mesaregia.ordenes.domain.enums.HitoOrden;
public record HitoRequest(@NotNull HitoOrden hito,@NotNull @Positive Long version,@Positive Long idUsuario,@Size(max=500) String motivo) {}
