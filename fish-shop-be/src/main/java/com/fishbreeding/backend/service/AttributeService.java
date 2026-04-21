package com.fishbreeding.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fishbreeding.backend.dto.AttributeRequest;
import com.fishbreeding.backend.dto.AttributeResponse;
import com.fishbreeding.backend.entity.Attribute;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.AttributeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final AttributeRepository attributeRepository;

    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream()
                .map(AttributeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AttributeResponse getAttributeById(Long id) {
        validateId(id);

        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attribute not found with id: " + id));

        return AttributeResponse.fromEntity(attribute);
    }

    public AttributeResponse createAttribute(AttributeRequest request) {

        // check duplicate name
        if (attributeRepository.existsByName(request.getName())) {
            throw new BadRequestException("Attribute name already exists");
        }

        Attribute attribute = Attribute.builder()
                .name(request.getName().trim())
                .build();

        Attribute saved = attributeRepository.save(attribute);
        return AttributeResponse.fromEntity(saved);
    }

    public AttributeResponse updateAttribute(Long id, AttributeRequest request) {
        validateId(id);

        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attribute not found with id: " + id));

        String newName = request.getName().trim();

        // check duplicate (trừ chính nó)
        if (!attribute.getName().equals(newName)
                && attributeRepository.existsByName(newName)) {
            throw new BadRequestException("Attribute name already exists");
        }

        attribute.setName(newName);

        Attribute updated = attributeRepository.save(attribute);
        return AttributeResponse.fromEntity(updated);
    }

    public void deleteAttribute(Long id) {
        validateId(id);

        if (!attributeRepository.existsById(id)) {
            throw new NotFoundException("Attribute not found with id: " + id);
        }

        attributeRepository.deleteById(id);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid ID");
        }
    }
}