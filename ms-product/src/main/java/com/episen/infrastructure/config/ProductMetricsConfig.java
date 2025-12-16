package com.episen.infrastructure.config;

import com.episen.domain.repository.ProductRepository;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Configuration des metriques personnalisees pour le service produit.
 */
@Component
@RequiredArgsConstructor
public class ProductMetricsConfig {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final MeterRegistry meterRegistry;
    private final ProductRepository productRepository;

    /**
     * Enregistre les jauges Micrometer au demarrage de l'application.
     */
    @PostConstruct
    public void registerGauges() {
        meterRegistry.gauge("products.low_stock.count",
                productRepository,
                repo -> repo.countByStockLessThan(LOW_STOCK_THRESHOLD));
    }
}
