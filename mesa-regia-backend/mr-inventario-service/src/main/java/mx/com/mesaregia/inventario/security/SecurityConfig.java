package mx.com.mesaregia.inventario.security;

import mx.com.mesaregia.inventario.security.internal.InternalServiceAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http,
      ObjectProvider<InternalServiceAuthenticationFilter> provider) throws Exception {
    http.csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    var internal = provider.getIfAvailable();
    if (internal != null)
      http.addFilterBefore(internal, UsernamePasswordAuthenticationFilter.class);
    http.authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/actuator/info", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
        .permitAll().anyRequest().authenticated());
    return http.build();
  }
}
