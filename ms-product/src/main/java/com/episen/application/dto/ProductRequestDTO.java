package com.episen.application.dto;

import com.episen.domain.enums.Category;
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

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {

    @NotBlank(message = "Le nom du produit ne peut pas etre vide")
    @Size(min = 3, max = 100, message = "Le nom du produit doit contenir entre 3 et 100 caracteres")
    private String name;

    @NotBlank(message = "La description du produit ne peut pas etre vide")
    @Size(min = 10, max = 500, message = "La description du produit doit contenir entre 10 et 500 caracteres")
    private String description;

    @NotNull(message = "Le prix du produit est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit etre superieur a 0")
    @Digits(integer = 12, fraction = 2, message = "Le prix doit avoir au maximum 2 decimales")
    private BigDecimal price;

    @NotNull(message = "Le stock du produit est obligatoire")
    @Min(value = 0, message = "Le stock doit etre superieur ou egal a 0")
    private Integer stock;

    @NotNull(message = "La categorie du produit est obligatoire")
    private Category category;

    private String imageUrl;

    private Boolean active;
}
