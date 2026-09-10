package mx.com.mesaregia.reportes.integration.client;

import mx.com.mesaregia.reportes.security.internal.InternalJwtService;
import org.slf4j.MDC;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class InternalRestClientFactory {
  private final InternalJwtService jwt;

  public InternalRestClientFactory(InternalJwtService jwt) {
    this.jwt = jwt;
  }

  public RestClient create(String baseUrl) {
    int timeout = Integer.parseInt(System.getenv().getOrDefault("MR_INTERNAL_HTTP_TIMEOUT_MS", "4000"));
    var rf = new SimpleClientHttpRequestFactory();
    rf.setConnectTimeout(timeout);
    rf.setReadTimeout(timeout);
    return RestClient.builder().baseUrl(baseUrl).requestFactory(rf)
        .requestInterceptor((request, body, execution) -> {
          request.getHeaders().setBearerAuth(jwt.issue());
          String correlation = MDC.get("correlationId");
          if (correlation != null && !correlation.isBlank())
            request.getHeaders().set("X-Correlation-Id", correlation);
          return execution.execute(request, body);
        }).build();
  }
}
