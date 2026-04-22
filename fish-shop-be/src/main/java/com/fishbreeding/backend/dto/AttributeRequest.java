package com.fishbreeding.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AttributeRequest {

	@NotBlank(message = "Attribute name is required")
	@Size(max = 50, message = "Attribute name must not exceed 50 characters")
	private String name;

	public AttributeRequest() {
	}

	public AttributeRequest(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
