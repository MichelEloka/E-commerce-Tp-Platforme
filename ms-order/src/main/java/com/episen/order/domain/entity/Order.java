package com.episen.order.domain.entity;

import com.episen.order.domain.enums.OrderStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'ID utilisateur est obligatoire")
    @Column(nullable = false)
    private Long userId;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @NotNull(message = "Le montant total est obligatoire")
    @DecimalMin(value = "0.0", message = "Le montant total doit etre superieur ou egal a 0")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @NotBlank(message = "L'adresse de livraison est obligatoire")
    @Size(min = 10, max = 200, message = "L'adresse de livraison doit contenir entre 10 et 200 caracteres")
    @Column(nullable = false, length = 200)
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotEmpty(message = "La commande doit contenir au moins un article")
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    // Méthode publique pour calculer le total (appelée depuis le service)
    public void calculateTotal() {
        if (items != null && !items.isEmpty()) {
            // D'abord calculer le subtotal de chaque item
            items.forEach(item -> {
                if (item.getQuantity() != null && item.getUnitPrice() != null) {
                    item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                } else {
                    item.setSubtotal(BigDecimal.ZERO);
                }
            });

            // Ensuite calculer le total
            this.totalAmount = items.stream()
                    .map(OrderItem::getSubtotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            this.totalAmount = BigDecimal.ZERO;
        }
    }
}
