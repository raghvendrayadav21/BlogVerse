package com.blogverse.gateway.filter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.blogverse.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Global JWT Authentication Filter for the API Gateway.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Skip JWT validation for public endpoints</li>
 *   <li>Extract and validate JWT from Authorization header</li>
 *   <li>Inject X-User-* headers for downstream service consumption</li>
 *   <li>Strip the Authorization header from forwarded requests (optional, security-hardened)</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    /**
     * Public endpoints that do not require a valid JWT token.
     */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/google",
            "/api/auth/refresh",
            "/oauth2/**",
            "/login/oauth2/**",
            "/api/posts/trending",
            "/api/posts/tags/trending",
            "/api/posts/{id}",
            "/api/posts/user/**",
            "/api/posts/hashtag/**",
            "/api/users/{id}",
            "/api/users/suggestions",
            "/api/users/*/followers",
            "/api/users/*/following",
            "/api/search/**",
            "/api/media/{id}",
            "/uploads/**",
            "/actuator/**",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        HttpMethod method = request.getMethod();

        // Always allow OPTIONS (preflight)
        if (HttpMethod.OPTIONS.equals(method)) {
            return chain.filter(exchange);
        }

        // Skip auth for public paths
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Extract token from Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or malformed Authorization header for path: {}", path);
            return writeUnauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT decodedJWT = jwtUtil.validateAndDecode(token);

            String userId   = jwtUtil.extractUserId(decodedJWT);
            String email    = jwtUtil.extractEmail(decodedJWT);
            String username = jwtUtil.extractUsername(decodedJWT);
            String role     = jwtUtil.extractRole(decodedJWT);

            log.debug("Authenticated request | userId={} | path={}", userId, path);

            // Mutate request: add user identity headers for downstream services
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", userId != null ? userId : "")
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-User-Username", username != null ? username : "")
                    .header("X-User-Name", username != null ? username : "")
                    .header("X-User-Role", role != null ? role : "USER")
                    // Remove original Authorization to prevent token leakage to downstream
                    .headers(headers -> headers.remove(HttpHeaders.AUTHORIZATION))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JWTVerificationException e) {
            log.warn("JWT validation failed for path {}: {}", path, e.getMessage());
            return writeUnauthorized(exchange, "Invalid or expired token");
        }
    }

    @Override
    public int getOrder() {
        // Run before routing filters
        return -1;
    }

    private boolean isPublicPath(String requestPath) {
        return PUBLIC_PATHS.stream()
                .anyMatch(pattern -> PATH_MATCHER.match(pattern, requestPath));
    }

    private Mono<Void> writeUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"success\":false,\"status\":401,\"message\":\"%s\",\"timestamp\":\"%s\"}",
                message,
                java.time.Instant.now().toString()
        );

        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        org.springframework.core.io.buffer.DataBuffer buffer =
                response.bufferFactory().wrap(bytes);

        return response.writeWith(Mono.just(buffer));
    }
}
