package com.fishbreeding.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @EmbeddedId
    private OrderItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_purchase", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceAtPurchase;
}