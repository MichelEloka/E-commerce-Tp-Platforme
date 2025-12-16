
package com.episen.application.mapper;

import com.episen.application.dto.ProductRequestDTO;
import com.episen.application.dto.ProductResponseDTO;
import com.episen.domain.entity.Product;
import org.springframework.stereotype.Component;

/**
 * Mappeur entre les entites produits et leurs representations DTO.
 */
@Component
public class ProductMapper {

    /**
     * Convertit un DTO de creation en entite persistable.
     *
     * @param dto informations du produit a creer
     * @return entite produit ou null si l'entree est nulle
     */
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

    /**
     * Convertit une entite produit en DTO de reponse.
     *
     * @param product entite produit
     * @return DTO correspondant ou null si l'entite est nulle
     */
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

    /**
     * Met a jour une entite existante a partir d'un DTO.
     *
     * @param dto     valeurs a appliquer
     * @param product entite cible a modifier
     */
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
