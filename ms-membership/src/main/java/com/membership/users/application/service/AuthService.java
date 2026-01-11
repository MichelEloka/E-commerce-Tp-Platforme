package com.membership.users.application.service;

import com.membership.users.application.dto.AuthRequestDTO;
import com.membership.users.application.dto.AuthResponseDTO;
import com.membership.users.domain.entity.User;
import com.membership.users.domain.repository.UserRepository;
import com.membership.users.infrastructure.exception.InvalidCredentialsException;
import com.membership.users.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification pour la generation des JWT.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDTO login(AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou mot de passe invalide"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new InvalidCredentialsException("Compte utilisateur inactif");
        }

        if (user.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Email ou mot de passe invalide");
        }

        String token = jwtService.generateToken(user);

        log.info("Authentification reussie pour {}", user.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .expiresIn(jwtService.getExpirationSeconds())
                .build();
    }
}
