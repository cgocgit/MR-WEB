package mx.com.mesaregia.reportes.integration.file;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.exception.ReporteExportException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class PdfReporteExporter implements ReporteFileExporter {
  @Override
  public FormatoExportacion formato() {
    return FormatoExportacion.PDF;
  }

  @Override
  public byte[] exportar(ReporteResultado reporte) {
    try {
      List<String> lines = new ArrayList<>();
      for (var row : ReporteFileSupport.rows(reporte)) {
        String line = String.join(" | ", row);
        lines.add(line.length() > 105 ? line.substring(0, 102) + "..." : line);
      }
      return buildPdf(lines);
    } catch (IOException ex) {
      throw new ReporteExportException("Error generando PDF", ex);
    }
  }

  private byte[] buildPdf(List<String> lines) throws IOException {
    List<List<String>> pages = new ArrayList<>();
    for (int i = 0; i < lines.size(); i += 48)
      pages.add(lines.subList(i, Math.min(i + 48, lines.size())));
    if (pages.isEmpty())
      pages.add(List.of("Reporte sin datos"));

    int pageCount = pages.size();
    int fontObj = 3 + pageCount * 2;
    List<byte[]> objects = new ArrayList<>();
    objects.add(bytes("<< /Type /Catalog /Pages 2 0 R >>"));

    StringBuilder kids = new StringBuilder("[");
    for (int i = 0; i < pageCount; i++)
      kids.append(3 + i * 2).append(" 0 R ");
    kids.append("]");
    objects.add(bytes("<< /Type /Pages /Kids " + kids + " /Count " + pageCount + " >>"));

    for (int i = 0; i < pageCount; i++) {
      int pageObj = 3 + i * 2;
      int contentObj = pageObj + 1;
      objects.add(bytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 " + fontObj
          + " 0 R >> >> /Contents " + contentObj + " 0 R >>"));
      StringBuilder stream = new StringBuilder("BT /F1 9 Tf 40 760 Td 12 TL ");
      boolean first = true;
      for (String line : pages.get(i)) {
        if (!first)
          stream.append("T* ");
        first = false;
        stream.append("(").append(ReporteFileSupport.pdfEscape(line)).append(") Tj ");
      }
      stream.append("ET");
      byte[] streamBytes = ReporteFileSupport.cp1252(stream.toString());
      ByteArrayOutputStream content = new ByteArrayOutputStream();
      content.write(bytes("<< /Length " + streamBytes.length + " >>\nstream\n"));
      content.write(streamBytes);
      content.write(bytes("\nendstream"));
      objects.add(content.toByteArray());
    }
    objects.add(bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"));

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    out.write(bytes("%PDF-1.4\n%âãÏÓ\n"));
    List<Integer> offsets = new ArrayList<>();
    offsets.add(0);
    for (int i = 0; i < objects.size(); i++) {
      offsets.add(out.size());
      out.write(bytes((i + 1) + " 0 obj\n"));
      out.write(objects.get(i));
      out.write(bytes("\nendobj\n"));
    }
    int xref = out.size();
    out.write(bytes("xref\n0 " + (objects.size() + 1) + "\n0000000000 65535 f \n"));
    for (int i = 1; i <= objects.size(); i++)
      out.write(bytes(String.format("%010d 00000 n \n", offsets.get(i))));
    out.write(bytes("trailer\n<< /Size " + (objects.size() + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF"));
    return out.toByteArray();
  }

  private byte[] bytes(String s) {
    return s.getBytes(StandardCharsets.ISO_8859_1);
  }
}
