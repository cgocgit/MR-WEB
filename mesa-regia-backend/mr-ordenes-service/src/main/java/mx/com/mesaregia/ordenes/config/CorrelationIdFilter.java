package mx.com.mesaregia.ordenes.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationIdFilter implements Filter {
  public static final String HEADER = "X-Correlation-Id", MDC_KEY = "correlationId";

  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    var r = (HttpServletRequest) req;
    var h = (HttpServletResponse) res;
    var id = r.getHeader(HEADER);
    if (id == null || id.isBlank())
      id = UUID.randomUUID().toString();
    MDC.put(MDC_KEY, id);
    h.setHeader(HEADER, id);
    try {
      chain.doFilter(req, res);
    } finally {
      MDC.remove(MDC_KEY);
    }
  }
}
