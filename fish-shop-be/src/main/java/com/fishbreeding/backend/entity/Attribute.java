package com.fishbreeding.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attributes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attribute_id")
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;
}