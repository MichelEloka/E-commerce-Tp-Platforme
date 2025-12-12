package com.episen.infrastructure.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Client pour interroger le microservice Order et savoir si un produit
 * est utilise dans au moins une commande.
 */
@Slf4j
@Component
public class OrderClient {

    private final RestTemplate restTemplate;
    private final String orderServiceBaseUrl;

    public OrderClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${order.service.url:http://localhost:8083}") String orderServiceBaseUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.orderServiceBaseUrl = orderServiceBaseUrl;
    }

    /**
     * Appelle le service Order. L'endpoint cible est a aligner avec le futur service :
     * - exemple propose : GET /api/v1/orders/product/{productId}/exists -> boolean
     * Adapter l'URL si l'implementation differe.
     */
    public boolean isProductInAnyOrder(Long productId) {
        String url = orderServiceBaseUrl + "/api/v1/orders/product/{productId}/exists";
        try {
            ResponseEntity<Boolean> response = restTemplate.getForEntity(url, Boolean.class, productId);
            return Boolean.TRUE.equals(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (RestClientException e) {
            log.error("Erreur lors de l'appel au service Order pour le produit {}", productId, e);
            throw new IllegalStateException("Impossible de verifier la presence du produit dans les commandes", e);
        }
    }
}
