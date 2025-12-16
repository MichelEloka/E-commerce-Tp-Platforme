package com.episen.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la mise a jour partielle du stock d'un produit.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockUpdateRequest {

    @NotNull(message = "Le stock est obligatoire")
    @Min(value = 0, message = "Le stock doit etre superieur ou egal a 0")
    private Integer stock;
}
