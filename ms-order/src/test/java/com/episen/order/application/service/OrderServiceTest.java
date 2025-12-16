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
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("Order Service Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private com.episen.order.application.mapper.OrderMapper orderMapper;

    @Mock
    private com.episen.order.application.mapper.OrderItemMapper orderItemMapper;

    @Mock
    private com.episen.order.infrastructure.client.ProductClient productClient;

    @Mock
    private com.episen.order.infrastructure.client.MembershipClient membershipClient;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
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

        OrderRequestDTO.builder()
                .userId(1L)
                .shippingAddress("123 Test Street")
                .items(List.of(itemRequest))
                .build();
    }

    @Test
    @DisplayName("Should get order by ID successfully")
    void testGetOrderById_Success() {
        OrderResponseDTO expectedResponse = new OrderResponseDTO();
        expectedResponse.setId(1L);
        expectedResponse.setStatus(OrderStatus.PENDING);
        expectedResponse.setTotalAmount(new BigDecimal("100.00"));

        when(orderRepository.findByIdWithItems(1L)).thenReturn(Optional.of(testOrder));
        when(orderMapper.toDto(testOrder)).thenReturn(expectedResponse);

        OrderResponseDTO result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(new BigDecimal("100.00"), result.getTotalAmount());

        verify(orderRepository, times(1)).findByIdWithItems(1L);
        verify(orderMapper, times(1)).toDto(testOrder);
    }

    @Test
    @DisplayName("Should throw exception when order not found by ID")
    void testGetOrderById_NotFound() {
        when(orderRepository.findByIdWithItems(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById(999L);
        });

        verify(orderRepository, times(1)).findByIdWithItems(999L);
    }

    @Test
    @DisplayName("Should update order status successfully")
    void testUpdateOrderStatus_Success() {
        OrderResponseDTO expectedResponse = new OrderResponseDTO();
        expectedResponse.setId(1L);
        expectedResponse.setStatus(OrderStatus.CONFIRMED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(orderMapper.toDto(any(Order.class))).thenReturn(expectedResponse);

        OrderResponseDTO result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(OrderStatus.CONFIRMED, result.getStatus());

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when trying to update status of delivered order")
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
    @DisplayName("Should cancel order successfully")
    void testCancelOrder_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        orderService.cancelOrder(1L);

        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when trying to cancel already cancelled order")
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
    @DisplayName("Should get all orders by user ID")
    void testGetOrdersByUserId() {
        OrderResponseDTO expectedResponse = new OrderResponseDTO();
        expectedResponse.setId(1L);
        expectedResponse.setUserId(1L);

        when(orderRepository.findByUserId(1L)).thenReturn(List.of(testOrder));
        when(orderMapper.toDto(testOrder)).thenReturn(expectedResponse);

        List<OrderResponseDTO> results = orderService.getOrdersByUserId(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getUserId());

        verify(orderRepository, times(1)).findByUserId(1L);
    }

    @Test
    @DisplayName("Should get all orders by status")
    void testGetOrdersByStatus() {
        OrderResponseDTO expectedResponse = new OrderResponseDTO();
        expectedResponse.setId(1L);
        expectedResponse.setStatus(OrderStatus.PENDING);

        when(orderRepository.findByStatusWithItems(OrderStatus.PENDING)).thenReturn(List.of(testOrder));
        when(orderMapper.toDto(testOrder)).thenReturn(expectedResponse);

        List<OrderResponseDTO> results = orderService.getOrdersByStatus(OrderStatus.PENDING);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(OrderStatus.PENDING, results.get(0).getStatus());

        verify(orderRepository, times(1)).findByStatusWithItems(OrderStatus.PENDING);
    }

    @Test
    @DisplayName("Should get all orders")
    void testGetAllOrders() {
        OrderResponseDTO expectedResponse = new OrderResponseDTO();
        expectedResponse.setId(1L);

        when(orderRepository.findAllWithItems()).thenReturn(List.of(testOrder));
        when(orderMapper.toDto(testOrder)).thenReturn(expectedResponse);

        List<OrderResponseDTO> results = orderService.getAllOrders();

        assertNotNull(results);
        assertEquals(1, results.size());

        verify(orderRepository, times(1)).findAllWithItems();
    }
}
