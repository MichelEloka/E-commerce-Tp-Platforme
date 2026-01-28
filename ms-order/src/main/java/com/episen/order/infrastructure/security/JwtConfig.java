package com.episen.order.infrastructure.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

    @Bean
    public RSAPublicKey jwtPublicKey(JwtProperties properties) {
        return readPublicKey(properties.publicKeyPath());
    }

    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    private RSAPublicKey readPublicKey(String path) {
        byte[] keyBytes = readKeyBytes(path, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(keyBytes));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to parse public key", ex);
        }
    }

    private byte[] readKeyBytes(String path, String header, String footer) {
        if (path == null || path.isBlank()) {
            throw new IllegalStateException("JWT public key path is not configured");
        }
        try {
            String key = Files.readString(Path.of(path), StandardCharsets.UTF_8);
            String sanitized = key.replace(header, "")
                    .replace(footer, "")
                    .replaceAll("\\s", "");
            return Base64.getDecoder().decode(sanitized);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read key file: " + path, ex);
        }
    }
}
