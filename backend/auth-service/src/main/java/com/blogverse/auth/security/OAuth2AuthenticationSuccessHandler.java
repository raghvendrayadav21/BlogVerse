package com.blogverse.auth.security;

import com.blogverse.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Handles successful Google OAuth2 authentication.
 *
 * <p>Flow:
 * 1. Google authenticates the user → Spring Security receives OIDC token
 * 2. This handler is invoked with the authenticated user info
 * 3. Calls AuthService to create/find user and generate JWT
 * 4. Redirects frontend to the callback URL with tokens as query params
 */
import org.springframework.context.annotation.Lazy;

@Slf4j
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    public OAuth2AuthenticationSuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }

    // Frontend callback URL where tokens will be delivered
    private static final String FRONTEND_REDIRECT_URL = "http://localhost:3000/oauth2/callback";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        String email    = oidcUser.getEmail();
        String name     = oidcUser.getFullName();
        String googleId = oidcUser.getSubject();
        String picture  = oidcUser.getPicture();

        log.info("Google OAuth2 success for email: {}", email);

        var authResponse = authService.processGoogleOAuth(email, name, null, googleId, null);

        // Redirect to frontend with tokens
        String redirectUrl = UriComponentsBuilder.fromUriString(FRONTEND_REDIRECT_URL)
                .queryParam("accessToken", authResponse.getAccessToken())
                .queryParam("refreshToken", authResponse.getRefreshToken())
                .queryParam("userId", authResponse.getUserId())
                .queryParam("username", authResponse.getUsername())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
