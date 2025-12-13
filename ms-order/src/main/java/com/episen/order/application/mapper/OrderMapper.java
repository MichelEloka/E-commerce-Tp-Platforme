package com.episen.order.application.mapper;

import com.episen.order.application.dto.OrderRequestDTO;
import com.episen.order.application.dto.OrderResponseDTO;
import com.episen.order.domain.entity.Order;
import com.episen.order.domain.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderResponseDTO toDto(Order order) {
        if (order == null) {
            return null;
        }

        List<com.episen.order.application.dto.OrderItemResponseDTO> itemDtos = order.getItems() != null
                ? order.getItems().stream()
                        .map(orderItemMapper::toDto)
                        .collect(Collectors.toList())
                : null;

        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public Order toEntity(OrderRequestDTO dto, List<OrderItem> items) {
        if (dto == null) {
            return null;
        }

        Order order = Order.builder()
                .userId(dto.getUserId())
                .shippingAddress(dto.getShippingAddress())
                .build();

        if (items != null) {
            items.forEach(order::addItem);
        }

        return order;
    }
}
