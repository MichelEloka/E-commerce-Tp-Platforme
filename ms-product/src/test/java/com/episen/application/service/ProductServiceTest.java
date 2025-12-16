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
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Product Service Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private OrderClient orderClient;

    private ProductService productService;

    private final SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, productMapper, meterRegistry, orderClient);
    }

    @Test
    @DisplayName("Should create product successfully and return DTO")
    void createProduct_shouldSaveAndReturnDto() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("Laptop")
                .description("Powerful laptop")
                .price(new BigDecimal("999.99"))
                .stock(10)
                .category(Category.ELECTRONICS)
                .build();

        Product entity = Product.builder()
                .id(1L)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .build();

        ProductResponseDTO response = ProductResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .stock(entity.getStock())
                .category(entity.getCategory())
                .build();

        given(productRepository.existsByNameIgnoreCase(request.getName())).willReturn(false);
        given(productMapper.toEntity(request)).willReturn(entity);
        given(productRepository.save(entity)).willReturn(entity);
        given(productMapper.toDto(entity)).willReturn(response);

        ProductResponseDTO result = productService.createProduct(request);

        assertEquals(response, result);
        verify(productRepository).save(entity);
    }

    @Test
    @DisplayName("Should throw exception when product name already exists")
    void createProduct_shouldThrowWhenNameAlreadyExists() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("Existing")
                .description("desc")
                .price(new BigDecimal("10.00"))
                .stock(5)
                .category(Category.ELECTRONICS)
                .build();

        given(productRepository.existsByNameIgnoreCase(request.getName())).willReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when product not found by ID")
    void getProductById_shouldThrowWhenNotFound() {
        given(productRepository.findById(42L)).willReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(42L));
    }

    @Test
    @DisplayName("Should throw exception when trying to delete product that is in an order")
    void deleteProduct_shouldThrowWhenProductInOrder() {
        Product product = Product.builder()
                .id(2L)
                .name("Phone")
                .price(new BigDecimal("100.00"))
                .stock(3)
                .category(Category.ELECTRONICS)
                .build();

        given(productRepository.findById(product.getId())).willReturn(Optional.of(product));
        given(orderClient.isProductInAnyOrder(product.getId())).willReturn(true);

        assertThrows(IllegalStateException.class, () -> productService.deleteProduct(product.getId()));
        verify(productRepository, never()).delete(any());
        verify(orderClient).isProductInAnyOrder(eq(product.getId()));
    }
}
