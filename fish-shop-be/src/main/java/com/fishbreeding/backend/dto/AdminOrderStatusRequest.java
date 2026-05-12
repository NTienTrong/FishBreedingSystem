package com.fishbreeding.backend.dto;

import com.fishbreeding.backend.entity.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderStatusRequest {
    private OrderStatus orderStatus;
    private String ghnOrderCode;
}
