package mx.com.mesaregia.clientes.security.internal;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

public class InternalServiceAuthenticationFilter extends OncePerRequestFilter {
    private final InternalJwtService jwt;
    private final Set<String> allowedCallers;

    public InternalServiceAuthenticationFilter(InternalJwtService jwt, Set<String> allowedCallers) {
        this.jwt = jwt;
        this.allowedCallers = Set.copyOf(allowedCallers);
    }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                var issuer = jwt.verifyIfInternal(token, allowedCallers);
                if (issuer.isPresent()) {
                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"),
                            new SimpleGrantedAuthority("service:" + issuer.get()));
                    var authentication = new UsernamePasswordAuthenticationToken(issuer.get(), token, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (BadCredentialsException ex) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
