package com.episen.infrastructure.health;

import com.episen.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Component;

/**
 * Indicateur de sante qui signale les produits dont le stock passe sous un seuil.
 */
@Component
@RequiredArgsConstructor
public class LowStockHealthIndicator extends AbstractHealthIndicator {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;

    /**
     * Construit la reponse de sante en fonction du nombre de produits sous le seuil.
     *
     * @param builder constructeur de l'etat de sante
     */
    @Override
    protected void doHealthCheck(Health.Builder builder) {
        long lowStockCount = productRepository.countByStockLessThan(LOW_STOCK_THRESHOLD);

        builder.withDetail("threshold", LOW_STOCK_THRESHOLD)
                .withDetail("lowStockCount", lowStockCount);

        if (lowStockCount > 0) {
            builder.status(Status.UP).withDetail("status", "LOW_STOCK");
        } else {
            builder.up();
        }
    }
}
