package com.fishbreeding.backend.dto;

import com.fishbreeding.backend.entity.Attribute;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeResponse {
	private Long id;
	private String name;

	public static AttributeResponse fromEntity(Attribute attribute) {
		if (attribute == null) {
			return null;
		}

		return AttributeResponse.builder()
				.id(attribute.getId())
				.name(attribute.getName())
				.build();
	}
}
