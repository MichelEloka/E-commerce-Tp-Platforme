package com.membership.users.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la reponse d'authentification.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;
    private long expiresIn;
}
