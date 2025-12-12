package com.episen.application.service;

import com.episen.application.dto.ProductRequestDTO;
import com.episen.application.dto.ProductResponseDTO;
import com.episen.application.mapper.ProductMapper;
import com.episen.domain.entity.Product;
import com.episen.domain.enums.Category;
import com.episen.domain.repository.ProductRepository;
import com.episen.infrastructure.client.OrderClient;
import com.episen.infrastructure.exception.ResourceAlreadyExistsException;
import com.episen.infrastructure.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Validated
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MeterRegistry meterRegistry;
    private final OrderClient orderClient;

    public List<ProductResponseDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = findProductOrThrow(id);
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductResponseDTO createProduct(@Valid ProductRequestDTO dto) {
        if (productRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ResourceAlreadyExistsException("Product", "name", dto.getName());
        }

        Product product = productMapper.toEntity(dto);
        Product saved = productRepository.save(product);

        incrementCreatedCounter(saved.getCategory());

        return productMapper.toDto(saved);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, @Valid ProductRequestDTO dto) {
        Product existing = findProductOrThrow(id);
        productMapper.updateEntityFromDto(dto, existing);
        Product updated = productRepository.save(existing);

        incrementCounter("products.updated");

        return productMapper.toDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product existing = findProductOrThrow(id);
        // Règle métier: ne pas supprimer si le produit est présent dans une commande
        if (orderClient.isProductInAnyOrder(id)) {
            throw new IllegalStateException("Le produit ne peut pas etre supprime car il est utilise dans une commande");
        }
        productRepository.delete(existing);
        incrementCounter("products.deleted");
    }

    public List<ProductResponseDTO> searchProductsByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProductsByCategory(Category category) {
        List<Product> products = productRepository.findByCategory(category);
        return products.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getAvailableProducts() {
        List<Product> products = productRepository.findByStockGreaterThanAndActiveTrue(0);
        return products.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateStock(Long id,
                                          @NotNull(message = "Le stock est obligatoire")
                                          @Min(value = 0, message = "Le stock doit etre superieur ou egal a 0")
                                          Integer stock) {
        Product product = findProductOrThrow(id);
        product.setStock(stock);
        Product saved = productRepository.save(product);
        incrementCounter("products.stock_updated");
        return productMapper.toDto(saved);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private void incrementCreatedCounter(Category category) {
        Counter.builder("products.created")
                .description("Nombre de produits crees")
                .tag("category", category != null ? category.name() : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    private void incrementCounter(String name) {
        Counter.builder(name)
                .description("Compteur automatique pour les produits")
                .register(meterRegistry)
                .increment();
    }
}
