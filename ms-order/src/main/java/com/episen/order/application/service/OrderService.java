package com.episen.order.application.service;

import com.episen.order.application.dto.OrderItemRequestDTO;
import com.episen.order.application.dto.OrderRequestDTO;
import com.episen.order.application.dto.OrderResponseDTO;
import com.episen.order.application.mapper.OrderItemMapper;
import com.episen.order.application.mapper.OrderMapper;
import com.episen.order.domain.entity.Order;
import com.episen.order.domain.entity.OrderItem;
import com.episen.order.domain.enums.OrderStatus;
import com.episen.order.domain.repository.OrderItemRepository;
import com.episen.order.domain.repository.OrderRepository;
import com.episen.order.infrastructure.client.MembershipClient;
import com.episen.order.infrastructure.client.ProductClient;
import com.episen.order.infrastructure.exception.ResourceNotFoundException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Validated
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final MembershipClient membershipClient;
    private final ProductClient productClient;
    private final MeterRegistry meterRegistry;

    public List<OrderResponseDTO> getAllOrders() {
        log.debug("Recuperation de toutes les commandes");
        List<Order> orders = orderRepository.findAllWithItems();
        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(Long id) {
        log.debug("Recuperation de la commande avec id: {}", id);
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return orderMapper.toDto(order);
    }

    @Transactional
    public OrderResponseDTO createOrder(@Valid OrderRequestDTO dto) {
        log.debug("Creation d'une nouvelle commande pour l'utilisateur: {}", dto.getUserId());

        // Verifier que l'utilisateur existe
        if (!membershipClient.userExists(dto.getUserId())) {
            throw new ResourceNotFoundException("User", "id", dto.getUserId());
        }

        // Verifier chaque produit et construire les OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            ProductClient.ProductResponseDTO product = productClient.getProduct(itemDto.getProductId());

            // Verifier le stock
            if (product.getStock() < itemDto.getQuantity()) {
                throw new IllegalStateException(
                        "Stock insuffisant pour le produit: " + product.getName() +
                                ". Stock disponible: " + product.getStock() +
                                ", Quantite demandee: " + itemDto.getQuantity());
            }

            OrderItem orderItem = orderItemMapper.toEntity(itemDto, product.getName(), product.getPrice());
            orderItems.add(orderItem);
        }

        // Creer la commande
        Order order = orderMapper.toEntity(dto, orderItems);

        // Sauvegarder (cascade sur items)
        Order savedOrder = orderRepository.save(order);

        // Deduire le stock pour chaque produit
        for (OrderItem item : savedOrder.getItems()) {
            productClient.updateStock(item.getProductId(), -item.getQuantity());
        }

        // Incrementer les metriques
        incrementOrderCounter(savedOrder.getStatus());

        log.info("Commande creee avec succes. ID: {}, Montant total: {}", savedOrder.getId(), savedOrder.getTotalAmount());
        return orderMapper.toDto(savedOrder);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, OrderStatus newStatus) {
        log.debug("Mise a jour du statut de la commande {} vers {}", id, newStatus);

        Order order = findOrderOrThrow(id);
        validateOrderCanBeModified(order);

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        log.info("Statut de la commande {} mis a jour vers {}", id, newStatus);
        return orderMapper.toDto(updated);
    }

    @Transactional
    public void cancelOrder(Long id) {
        log.debug("Annulation de la commande {}", id);

        Order order = findOrderOrThrow(id);
        validateOrderCanBeModified(order);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        log.info("Commande {} annulee", id);
    }

    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        log.debug("Recuperation des commandes pour l'utilisateur: {}", userId);
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        log.debug("Recuperation des commandes avec le statut: {}", status);
        List<Order> orders = orderRepository.findByStatusWithItems(status);
        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    public boolean isProductInAnyOrder(Long productId) {
        return orderItemRepository.existsByProductId(productId);
    }

    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private void validateOrderCanBeModified(Order order) {
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Une commande DELIVERED ou CANCELLED ne peut plus etre modifiee");
        }
    }

    private void incrementOrderCounter(OrderStatus status) {
        Counter.builder("orders.created")
                .description("Nombre de commandes creees")
                .tag("status", status.name())
                .register(meterRegistry)
                .increment();
    }
}
