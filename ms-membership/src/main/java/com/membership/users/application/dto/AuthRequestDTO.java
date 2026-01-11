package com.membership.users.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la requete d'authentification (login).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequestDTO {

    @NotBlank(message = "L'email ne peut pas etre vide")
    @Email(message = "L'email doit etre valide")
    private String email;

    @NotBlank(message = "Le mot de passe ne peut pas etre vide")
    private String password;
}
