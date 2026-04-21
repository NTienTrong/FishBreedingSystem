package com.fishbreeding.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValueId implements Serializable {
    private Long productId;
    private Long attributeId;
}