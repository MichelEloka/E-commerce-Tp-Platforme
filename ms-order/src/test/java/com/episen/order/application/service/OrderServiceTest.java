package com.episen.order.application.service;

import com.episen.order.application.dto.OrderItemRequestDTO;
import com.episen.order.application.dto.OrderRequestDTO;
import com.episen.order.application.dto.OrderResponseDTO;
import com.episen.order.domain.entity.Order;
import com.episen.order.domain.entity.OrderItem;
import com.episen.order.domain.enums.OrderStatus;
import com.episen.order.domain.repository.OrderRepository;
import com.episen.order.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private OrderRequestDTO testOrderRequest;

    @BeforeEach
    void setUp() {
        testOrder = Order.builder()
                .id(1L)
                .userId(1L)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("100.00"))
                .shippingAddress("123 Test Street")
                .items(new ArrayList<>())
                .build();

        OrderItem testItem = OrderItem.builder()
                .id(1L)
                .order(testOrder)
                .productId(1L)
                .productName("Test Product")
                .quantity(2)
                .unitPrice(new BigDecimal("50.00"))
                .subtotal(new BigDecimal("100.00"))
                .build();

        testOrder.getItems().add(testItem);

        OrderItemRequestDTO itemRequest = OrderItemRequestDTO.builder()
                .productId(1L)
                .quantity(2)
                .build();

        testOrderRequest = OrderRequestDTO.builder()
                .userId(1L)
                .shippingAddress("123 Test Street")
                .items(List.of(itemRequest))
                .build();
    }

    @Test
    void testGetOrderById_Success() {
        when(orderRepository.findByIdWithItems(1L)).thenReturn(Optional.of(testOrder));

        OrderResponseDTO result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(new BigDecimal("100.00"), result.getTotalAmount());
        assertEquals(1, result.getItems().size());

        verify(orderRepository, times(1)).findByIdWithItems(1L);
    }

    @Test
    void testGetOrderById_NotFound() {
        when(orderRepository.findByIdWithItems(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById(999L);
        });

        verify(orderRepository, times(1)).findByIdWithItems(999L);
    }

    @Test
    void testUpdateOrderStatus_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        OrderResponseDTO result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(OrderStatus.CONFIRMED, result.getStatus());

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void testUpdateOrderStatus_DeliveredOrder_ShouldThrowException() {
        testOrder.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(IllegalStateException.class, () -> {
            orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);
        });

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void testCancelOrder_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        orderService.cancelOrder(1L);

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void testCancelOrder_AlreadyCancelled_ShouldThrowException() {
        testOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(IllegalStateException.class, () -> {
            orderService.cancelOrder(1L);
        });

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void testGetOrdersByUserId() {
        when(orderRepository.findByUserId(1L)).thenReturn(List.of(testOrder));

        List<OrderResponseDTO> results = orderService.getOrdersByUserId(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getUserId());

        verify(orderRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testGetOrdersByStatus() {
        when(orderRepository.findByStatusWithItems(OrderStatus.PENDING)).thenReturn(List.of(testOrder));

        List<OrderResponseDTO> results = orderService.getOrdersByStatus(OrderStatus.PENDING);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(OrderStatus.PENDING, results.get(0).getStatus());

        verify(orderRepository, times(1)).findByStatusWithItems(OrderStatus.PENDING);
    }

    @Test
    void testGetAllOrders() {
        when(orderRepository.findAllWithItems()).thenReturn(List.of(testOrder));

        List<OrderResponseDTO> results = orderService.getAllOrders();

        assertNotNull(results);
        assertEquals(1, results.size());

        verify(orderRepository, times(1)).findAllWithItems();
    }
}
