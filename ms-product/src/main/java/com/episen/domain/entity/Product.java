package com.episen.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.episen.domain.enums.Category;

/**
 * Entite JPA representant un produit de catalogue.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du produit ne peut pas etre vide")
    @Size(min = 3, max = 100, message = "Le nom du produit doit contenir entre 3 et 100 caracteres")
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @NotBlank(message = "La description du produit ne peut pas etre vide")
    @Size(min = 10, max = 500, message = "La description du produit doit contenir entre 10 et 500 caracteres")
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull(message = "Le prix du produit est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit etre superieur a 0")
    @Digits(integer = 12, fraction = 2, message = "Le prix doit avoir au maximum 2 decimales")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Le stock du produit est obligatoire")
    @Min(value = 0, message = "Le stock doit etre superieur ou egal a 0")
    @Column(nullable = false)
    private Integer stock;

    @NotNull(message = "La categorie du produit est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
