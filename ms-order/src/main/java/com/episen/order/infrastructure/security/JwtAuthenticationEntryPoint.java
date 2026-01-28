package com.episen.order.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        boolean expired = isExpired(authException);
        int status = expired ? HttpServletResponse.SC_FORBIDDEN : HttpServletResponse.SC_UNAUTHORIZED;
        response.setStatus(status);
        response.setContentType("application/json");
        String message = expired ? "Token expired" : "Unauthorized";
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }

    private boolean isExpired(AuthenticationException exception) {
        if (exception instanceof OAuth2AuthenticationException oauthException) {
            String description = oauthException.getError().getDescription();
            if (containsExpired(description)) {
                return true;
            }
        }
        if (containsExpired(exception.getMessage())) {
            return true;
        }
        Throwable cause = exception.getCause();
        while (cause != null) {
            if (containsExpired(cause.getMessage())) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    private boolean containsExpired(String value) {
        return value != null && value.toLowerCase().contains("expired");
    }
}
