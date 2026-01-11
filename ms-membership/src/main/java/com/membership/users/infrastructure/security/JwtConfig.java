package com.membership.users.infrastructure.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

    @Bean
    public RSAPrivateKey jwtPrivateKey(JwtProperties properties) {
        return readPrivateKey(properties.privateKeyPath());
    }

    @Bean
    public RSAPublicKey jwtPublicKey(JwtProperties properties) {
        return readPublicKey(properties.publicKeyPath());
    }

    @Bean
    public JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
        RSAKey rsaKey = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
        JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(rsaKey));
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    private RSAPrivateKey readPrivateKey(String path) {
        byte[] keyBytes = readKeyBytes(path, "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return (RSAPrivateKey) keyFactory.generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to parse private key", ex);
        }
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
            throw new IllegalStateException("JWT key path is not configured");
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
