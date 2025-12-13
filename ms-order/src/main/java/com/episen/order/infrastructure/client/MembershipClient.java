package com.episen.order.infrastructure.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class MembershipClient {

    private final RestTemplate restTemplate;
    private final String membershipServiceUrl;

    public MembershipClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${membership.service.url:http://localhost:8081}") String membershipServiceUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.membershipServiceUrl = membershipServiceUrl;
    }

    public boolean userExists(Long userId) {
        String url = membershipServiceUrl + "/api/v1/users/{id}";
        try {
            ResponseEntity<UserResponseDTO> response = restTemplate.getForEntity(url, UserResponseDTO.class, userId);
            return response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (RestClientException e) {
            log.error("Erreur lors de l'appel au service Membership pour userId {}", userId, e);
            throw new IllegalStateException("Impossible de verifier l'utilisateur", e);
        }
    }

    @Data
    public static class UserResponseDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }
}
