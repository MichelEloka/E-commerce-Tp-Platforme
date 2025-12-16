
package com.episen.application.mapper;

import com.episen.application.dto.ProductRequestDTO;
import com.episen.application.dto.ProductResponseDTO;
import com.episen.domain.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .active(dto.getActive() == null ? Boolean.TRUE : dto.getActive())
                .build();
    }

    public ProductResponseDTO toDto(Product product) {
        if (product == null) {
            return null;
        }
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public void updateEntityFromDto(ProductRequestDTO dto, Product product) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setCategory(dto.getCategory());
        product.setImageUrl(dto.getImageUrl());
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }
    }
}
