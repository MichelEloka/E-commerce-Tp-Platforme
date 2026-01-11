package com.membership.users.infrastructure.security;

import com.membership.users.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(jwtProperties.expirationSeconds());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ms-membership")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(String.valueOf(user.getId()))
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("roles", splitRoles(user.getRoles()))
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public long getExpirationSeconds() {
        return jwtProperties.expirationSeconds();
    }

    private List<String> splitRoles(String roles) {
        if (roles == null || roles.isBlank()) {
            return List.of();
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
