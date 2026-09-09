package mx.com.mesaregia.reportes.config;

import mx.com.mesaregia.reportes.exception.DependenciaNoDisponibleException;
import mx.com.mesaregia.reportes.integration.port.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UnavailableReportSourcesConfig {
    private DependenciaNoDisponibleException unavailable(String fuente) {
        return new DependenciaNoDisponibleException("Fuente " + fuente + " no integrada todavía; el adapter real se incorpora en la Etapa 10");
    }

    @Bean @ConditionalOnMissingBean(VentasReportSourcePort.class)
    VentasReportSourcePort ventasReportSourcePort() { return criterios -> { throw unavailable("Ventas"); }; }

    @Bean @ConditionalOnMissingBean(ClientesReportSourcePort.class)
    ClientesReportSourcePort clientesReportSourcePort() { return criterios -> { throw unavailable("Clientes"); }; }

    @Bean @ConditionalOnMissingBean(CotizacionesReportSourcePort.class)
    CotizacionesReportSourcePort cotizacionesReportSourcePort() { return criterios -> { throw unavailable("Cotizaciones"); }; }

    @Bean @ConditionalOnMissingBean(InventarioReportSourcePort.class)
    InventarioReportSourcePort inventarioReportSourcePort() { return criterios -> { throw unavailable("Inventario/Catálogo"); }; }
}
