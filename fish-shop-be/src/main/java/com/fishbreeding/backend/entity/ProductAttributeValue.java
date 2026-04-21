package com.fishbreeding.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_attribute_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeValue {
    @EmbeddedId
    private ProductAttributeValueId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("attributeId")
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    @Column(name = "attr_value", nullable = false)
    private String attrValue;
}