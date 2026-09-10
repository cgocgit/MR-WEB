package mx.com.mesaregia.reportes.integration.file;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.exception.ReporteExportException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
public class XlsxReporteExporter implements ReporteFileExporter {
  @Override
  public FormatoExportacion formato() {
    return FormatoExportacion.XLSX;
  }

  @Override
  public byte[] exportar(ReporteResultado reporte) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream(); ZipOutputStream zip = new ZipOutputStream(out)) {
      entry(zip, "[Content_Types].xml",
          """
              <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
              <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                <Default Extension="xml" ContentType="application/xml"/>
                <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
              </Types>
              """);
      entry(zip, "_rels/.rels",
          """
              <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
              <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
              </Relationships>
              """);
      entry(zip, "xl/workbook.xml",
          """
              <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
              <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                <sheets><sheet name="Reporte" sheetId="1" r:id="rId1"/></sheets>
              </workbook>
              """);
      entry(zip, "xl/_rels/workbook.xml.rels",
          """
              <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
              <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
              </Relationships>
              """);
      entry(zip, "xl/worksheets/sheet1.xml", sheet(reporte));
      zip.finish();
      return out.toByteArray();
    } catch (IOException ex) {
      throw new ReporteExportException("Error generando XLSX", ex);
    }
  }

  private String sheet(ReporteResultado reporte) {
    StringBuilder xml = new StringBuilder(
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>");
    int rowNum = 1;
    for (var row : ReporteFileSupport.rows(reporte)) {
      xml.append("<row r=\"").append(rowNum).append("\">");
      for (int c = 0; c < row.size(); c++) {
        String ref = column(c + 1) + rowNum;
        xml.append("<c r=\"").append(ref).append("\" t=\"inlineStr\"><is><t xml:space=\"preserve\">")
            .append(ReporteFileSupport.xml(row.get(c))).append("</t></is></c>");
      }
      xml.append("</row>");
      rowNum++;
    }
    return xml.append("</sheetData></worksheet>").toString();
  }

  private String column(int index) {
    StringBuilder s = new StringBuilder();
    int n = index;
    while (n > 0) {
      n--;
      s.insert(0, (char) ('A' + (n % 26)));
      n /= 26;
    }
    return s.toString();
  }

  private void entry(ZipOutputStream zip, String name, String content) throws IOException {
    zip.putNextEntry(new ZipEntry(name));
    zip.write(content.getBytes(StandardCharsets.UTF_8));
    zip.closeEntry();
  }
}
