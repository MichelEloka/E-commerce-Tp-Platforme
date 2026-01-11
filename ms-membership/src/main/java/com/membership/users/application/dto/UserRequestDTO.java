package com.membership.users.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'un utilisateur.
 * Best practices :
 * - Séparation des DTOs Request/Response
 * - Validation au niveau DTO
 * - Utilisation de Builder pattern
 * - Pas d'exposition de l'entité directement dans l'API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {

    @NotBlank(message = "Le prénom ne peut pas être vide")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String firstName;

    @NotBlank(message = "Le nom ne peut pas être vide")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String lastName;

    @NotBlank(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit être valide")
    private String email;

    @Size(min = 8, max = 128, message = "Le mot de passe doit contenir entre 8 et 128 caracteres")
    private String password;

    @Size(max = 100, message = "Les roles ne doivent pas depasser 100 caracteres")
    private String roles;
}
