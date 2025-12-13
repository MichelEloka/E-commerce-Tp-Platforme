package com.episen.order.infrastructure.client;

import com.episen.order.infrastructure.exception.ResourceNotFoundException;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Slf4j
@Component
public class ProductClient {

    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${product.service.url:http://localhost:8082}") String productServiceUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.productServiceUrl = productServiceUrl;
    }

    public ProductResponseDTO getProduct(Long productId) {
        String url = productServiceUrl + "/api/v1/products/{id}";
        try {
            return restTemplate.getForObject(url, ProductResponseDTO.class, productId);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Product", "id", productId);
        } catch (RestClientException e) {
            log.error("Erreur lors de l'appel au service Product pour productId {}", productId, e);
            throw new IllegalStateException("Impossible de recuperer le produit", e);
        }
    }

    public boolean isProductAvailable(Long productId, Integer requiredQuantity) {
        ProductResponseDTO product = getProduct(productId);
        return product != null && product.getStock() >= requiredQuantity;
    }

    public void updateStock(Long productId, Integer quantityChange) {
        ProductResponseDTO product = getProduct(productId);

        Integer newStock = product.getStock() + quantityChange;
        if (newStock < 0) {
            throw new IllegalStateException("Stock insuffisant pour le produit " + productId);
        }

        String url = productServiceUrl + "/api/v1/products/{id}/stock";
        StockUpdateRequest request = StockUpdateRequest.builder()
                .stock(newStock)
                .build();

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, new HttpEntity<>(request), ProductResponseDTO.class, productId);
        } catch (RestClientException e) {
            log.error("Erreur lors de la mise a jour du stock pour productId {}", productId, e);
            throw new IllegalStateException("Impossible de mettre a jour le stock", e);
        }
    }

    @Data
    public static class ProductResponseDTO {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer stock;
        private Boolean active;
    }

    @Data
    @Builder
    public static class StockUpdateRequest {
        private Integer stock;
    }
}
