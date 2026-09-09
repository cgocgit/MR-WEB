package mx.com.mesaregia.cotizaciones.application.service.impl;

import mx.com.mesaregia.cotizaciones.application.service.CotizacionDocumentService;
import mx.com.mesaregia.cotizaciones.mapper.CotizacionMapper;
import mx.com.mesaregia.cotizaciones.repository.CotizacionDetalleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CotizacionDocumentServiceImpl implements CotizacionDocumentService {
    private final CotizacionSupport support;
    private final CotizacionDetalleRepository detalles;

    public CotizacionDocumentServiceImpl(CotizacionSupport support, CotizacionDetalleRepository detalles) {
        this.support = support;
        this.detalles = detalles;
    }

    @Override
    public byte[] generarPdf(Long idCotizacion, Long idVersion) {
        var cotizacion = support.get(idCotizacion);
        var version = support.version(idCotizacion, idVersion);
        var response = CotizacionMapper.version(
                version,
                detalles.findByIdCotizacionVersionOrderByOrdenAsc(idVersion));

        String text = "Mesa Regia - " + cotizacion.getFolio()
                + " - " + response.folio()
                + " - Total: " + response.total();
        return simplePdf(text);
    }

    private byte[] simplePdf(String text) {
        String safe = text
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");

        String stream = "BT /F1 12 Tf 50 750 Td (" + safe + ") Tj ET";
        List<String> objects = List.of(
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
                "<< /Length " + stream.getBytes(StandardCharsets.ISO_8859_1).length + " >>\nstream\n" + stream + "\nendstream",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        );

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length);
            pdf.append(i + 1).append(" 0 obj\n")
                    .append(objects.get(i)).append("\nendobj\n");
        }

        int xref = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;
        pdf.append("xref\n0 ").append(objects.size() + 1)
                .append("\n0000000000 65535 f \n");
        for (int offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }
        pdf.append("trailer << /Size ").append(objects.size() + 1)
                .append(" /Root 1 0 R >>\nstartxref\n")
                .append(xref)
                .append("\n%%EOF");

        return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
    }
}
