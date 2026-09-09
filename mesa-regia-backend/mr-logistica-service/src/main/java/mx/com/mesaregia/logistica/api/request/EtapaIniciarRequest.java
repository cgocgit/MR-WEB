package mx.com.mesaregia.logistica.api.request; import jakarta.validation.constraints.*; public record EtapaIniciarRequest(@NotNull @Positive Long idUsuario,@NotNull @PositiveOrZero Long version){}
