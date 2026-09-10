package mx.com.mesaregia.cotizaciones.integration.dto;

import java.math.BigDecimal;

public record ConceptoPrecio(String codigo, String nombre, BigDecimal precioUnitarioAplicado,
    BigDecimal porcentajeAdicionalAplicado) {
}