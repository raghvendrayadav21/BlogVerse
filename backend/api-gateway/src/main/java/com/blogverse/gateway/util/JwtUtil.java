package com.blogverse.gateway.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT utility for the API Gateway — validates tokens and extracts claims.
 * Only validates the signature; no re-authentication with downstream services.
 */
@Slf4j
@Component
public class JwtUtil {

    private final JWTVerifier verifier;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        Algorithm algorithm = Algorithm.HMAC512(secret);
        this.verifier = JWT.require(algorithm)
                .withIssuer("blogverse-auth")
                .build();
    }

    /**
     * Validates and decodes the JWT token.
     *
     * @param token raw JWT string (without "Bearer " prefix)
     * @return the decoded JWT with all claims
     * @throws JWTVerificationException if the token is invalid or expired
     */
    public DecodedJWT validateAndDecode(String token) {
        return verifier.verify(token);
    }

    public String extractUserId(DecodedJWT jwt) {
        return jwt.getClaim("userId").asString();
    }

    public String extractEmail(DecodedJWT jwt) {
        return jwt.getClaim("email").asString();
    }

    public String extractUsername(DecodedJWT jwt) {
        return jwt.getClaim("username").asString();
    }

    public String extractRole(DecodedJWT jwt) {
        return jwt.getClaim("role").asString();
    }
}
