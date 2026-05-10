package com.fishbreeding.backend.dto.ghn;

import lombok.Data;

@Data
public class GhnResponse<T> {
    private T data;
}
