package com.membership.users.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String privateKeyPath, String publicKeyPath, long expirationSeconds) {
}
