package com.episen.order.application.mapper;

import com.episen.order.application.dto.OrderItemRequestDTO;
import com.episen.order.application.dto.OrderItemResponseDTO;
import com.episen.order.domain.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderItemMapper {

    public OrderItemResponseDTO toDto(OrderItem item) {
        if (item == null) {
            return null;
        }

        return OrderItemResponseDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    public OrderItem toEntity(OrderItemRequestDTO dto, String productName, BigDecimal unitPrice) {
        if (dto == null) {
            return null;
        }

        return OrderItem.builder()
                .productId(dto.getProductId())
                .productName(productName)
                .quantity(dto.getQuantity())
                .unitPrice(unitPrice)
                .build();
    }
}
