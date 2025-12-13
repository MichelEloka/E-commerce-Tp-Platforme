package com.episen.order.infrastructure.health;

import com.episen.order.infrastructure.client.MembershipClient;
import com.episen.order.infrastructure.client.ProductClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExternalServicesHealthIndicator extends AbstractHealthIndicator {

    private final MembershipClient membershipClient;
    private final ProductClient productClient;

    @Override
    protected void doHealthCheck(Health.Builder builder) {
        boolean membershipUp = checkMembershipService();
        boolean productUp = checkProductService();

        builder.withDetail("membershipService", membershipUp ? "UP" : "DOWN")
               .withDetail("productService", productUp ? "UP" : "DOWN");

        if (membershipUp && productUp) {
            builder.up();
        } else {
            builder.down();
        }
    }

    private boolean checkMembershipService() {
        try {
            // Try to call the membership service
            // Using a non-existent ID to avoid creating dependencies
            membershipClient.userExists(Long.MAX_VALUE);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkProductService() {
        try {
            // Try to call the product service
            // Using a non-existent ID to avoid creating dependencies
            productClient.getProduct(Long.MAX_VALUE);
            return true;
        } catch (com.episen.order.infrastructure.exception.ResourceNotFoundException e) {
            // 404 is expected, means service is UP
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
