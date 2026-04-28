package com.fishbreeding.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String identifier;
    private String password;
}
