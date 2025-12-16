package com.episen.order.infrastructure.config;

import com.episen.order.domain.enums.OrderStatus;
import com.episen.order.domain.repository.OrderRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class OrderMetricsConfig {

    private final MeterRegistry meterRegistry;
    private final OrderRepository orderRepository;

    @PostConstruct
    public void registerGauges() {
        // Gauge: Total amount of today's orders
        meterRegistry.gauge("orders.today.total_amount",
                orderRepository,
                repo -> {
                    BigDecimal total = repo.sumTodayOrderAmounts();
                    return total != null ? total.doubleValue() : 0.0;
                });

        // Gauge: Count of today's orders
        meterRegistry.gauge("orders.today.count",
                orderRepository,
                OrderRepository::countTodayOrders);

        // Gauges for each status count
        for (OrderStatus status : OrderStatus.values()) {
            meterRegistry.gauge("orders.count.by_status",
                    Tags.of("status", status.name()),
                    orderRepository,
                    repo -> repo.countByStatus(status));
        }
    }
}
