package mx.com.mesaregia.logistica.security.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Component
public class InternalJwtService {
  public static final String AUDIENCE = "mesa-regia-internal";
  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder B64D = Base64.getUrlDecoder();
  private static final Map<String, String> SECRET_ENV = Map.of(
      "mr-seguridad-service", "MR_INTERNAL_SECRET_SEGURIDAD",
      "mr-clientes-service", "MR_INTERNAL_SECRET_CLIENTES",
      "mr-catalogo-service", "MR_INTERNAL_SECRET_CATALOGO",
      "mr-inventario-service", "MR_INTERNAL_SECRET_INVENTARIO",
      "mr-pagos-service", "MR_INTERNAL_SECRET_PAGOS",
      "mr-cotizaciones-service", "MR_INTERNAL_SECRET_COTIZACIONES",
      "mr-ordenes-service", "MR_INTERNAL_SECRET_ORDENES",
      "mr-logistica-service", "MR_INTERNAL_SECRET_LOGISTICA",
      "mr-reportes-service", "MR_INTERNAL_SECRET_REPORTES");

  private final ObjectMapper json;
  private final Environment environment;
  private final String serviceName;

  public InternalJwtService(ObjectMapper json, Environment environment) {
    this.json = json;
    this.environment = environment;
    this.serviceName = environment.getProperty("spring.application.name");
  }

  public String issue() {
    try {
      long now = Instant.now().getEpochSecond();
      var header = Map.of("alg", "HS256", "typ", "JWT");
      var payload = new LinkedHashMap<String, Object>();
      payload.put("iss", serviceName);
      payload.put("aud", AUDIENCE);
      payload.put("iat", now);
      payload.put("exp", now + 90);
      payload.put("jti", UUID.randomUUID().toString());
      String h = B64.encodeToString(json.writeValueAsBytes(header));
      String p = B64.encodeToString(json.writeValueAsBytes(payload));
      String signingInput = h + "." + p;
      return signingInput + "." + B64.encodeToString(hmac(signingInput, secretFor(serviceName)));
    } catch (Exception ex) {
      throw new IllegalStateException("No fue posible emitir identidad interna", ex);
    }
  }

  public Optional<String> verifyIfInternal(String token, Set<String> allowedCallers) {
    try {
      String[] parts = token.split("\\.");
      if (parts.length != 3)
        return Optional.empty();
      Map<String, Object> payload = json.readValue(B64D.decode(parts[1]), new TypeReference<>() {
      });
      if (!AUDIENCE.equals(String.valueOf(payload.get("aud"))))
        return Optional.empty();
      String issuer = String.valueOf(payload.get("iss"));
      if (!allowedCallers.contains(issuer))
        throw new BadCredentialsException("Servicio interno no autorizado: " + issuer);
      String input = parts[0] + "." + parts[1];
      byte[] expected = hmac(input, secretFor(issuer));
      byte[] received = B64D.decode(parts[2]);
      if (!MessageDigest.isEqual(expected, received))
        throw new BadCredentialsException("Firma de servicio interno inválida");
      long exp = ((Number) payload.get("exp")).longValue();
      if (exp < Instant.now().getEpochSecond())
        throw new BadCredentialsException("Token interno expirado");
      return Optional.of(issuer);
    } catch (BadCredentialsException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new BadCredentialsException("Token interno inválido", ex);
    }
  }

  private byte[] hmac(String value, String secret) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
  }

  private String secretFor(String service) {
    String envName = SECRET_ENV.get(service);
    if (envName == null)
      throw new IllegalStateException("Servicio interno desconocido: " + service);
    String value = System.getenv(envName);
    if (value != null && !value.isBlank())
      return value;
    boolean prod = Arrays.asList(environment.getActiveProfiles()).contains("prod");
    if (prod)
      throw new IllegalStateException("Falta variable obligatoria " + envName + " para identidad interna");
    return "mesa-regia-local-" + service + "-secret-v1";
  }
}
