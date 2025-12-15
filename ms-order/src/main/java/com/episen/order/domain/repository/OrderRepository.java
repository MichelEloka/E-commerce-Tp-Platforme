package com.episen.order.domain.repository;

import com.episen.order.domain.entity.Order;
import com.episen.order.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE CAST(o.orderDate AS LocalDate) = CURRENT_DATE")
    long countTodayOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE CAST(o.orderDate AS LocalDate) = CURRENT_DATE")
    BigDecimal sumTodayOrderAmounts();

    // Fetch all orders with their items in a single query to avoid N+1 problem
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items")
    List<Order> findAllWithItems();

    // Fetch a single order with its items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(Long id);

    // Fetch orders by status with their items
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status")
    List<Order> findByStatusWithItems(OrderStatus status);
}
