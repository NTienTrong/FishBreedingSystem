package com.fishbreeding.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.dto.ProductAttributeValueRequest;
import com.fishbreeding.backend.dto.ProductImageRequest;
import com.fishbreeding.backend.dto.ProductRequest;
import com.fishbreeding.backend.dto.ProductResponse;
import com.fishbreeding.backend.entity.Attribute;
import com.fishbreeding.backend.entity.Category;
import com.fishbreeding.backend.entity.Product;
import com.fishbreeding.backend.entity.ProductAttributeValue;
import com.fishbreeding.backend.entity.ProductAttributeValueId;
import com.fishbreeding.backend.entity.ProductImage;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.AttributeRepository;
import com.fishbreeding.backend.repository.CategoryRepository;
import com.fishbreeding.backend.repository.ProductAttributeValueRepository;
import com.fishbreeding.backend.repository.ProductImageRepository;
import com.fishbreeding.backend.repository.ProductRepository;
import com.fishbreeding.backend.util.SlugUtil;
import com.fishbreeding.backend.validator.ProductValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AttributeRepository attributeRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductValidator productValidator;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "products")
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAllByOrderByIdAsc();
        if (products.isEmpty()) {
            return List.of();
        }

        List<Long> productIds = products.stream().map(Product::getId).toList();

        Map<Long, List<ProductImage>> imagesByProduct = productImageRepository
            .findByProduct_IdInOrderBySortOrderAscIdAsc(productIds)
            .stream()
            .collect(Collectors.groupingBy(image -> image.getProduct().getId()));

        Map<Long, List<ProductAttributeValue>> attributesByProduct = productAttributeValueRepository
            .findByProduct_IdInOrderByAttribute_IdAsc(productIds)
            .stream()
            .collect(Collectors.groupingBy(value -> value.getProduct().getId()));

        return products.stream()
            .map(product -> toResponse(product, imagesByProduct, attributesByProduct))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "productById", key = "#id")
    public ProductResponse getProductById(Long id) {
        productValidator.validateId(id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));

        return toResponse(product);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        String name = request.getName().trim();
        String slug = buildUniqueSlug(name, null);

        Set<Category> categories = resolveCategories(request.getCategoryIds());

        Product product = Product.builder()
                .name(name)
                .slug(slug)
            .sku(null)
                .summary(trimToNull(request.getSummary()))
                .description(trimToNull(request.getDescription()))
                .price(request.getPrice())
            .stockQuantity(defaultStockQuantity(request.getStockQuantity()))
            .isActive(defaultIsActive(request.getIsActive()))
                .categories(categories)
                .build();

        Product saved = productRepository.save(product);

        saved.setSku(buildAutoSku(saved.getId()));
        saved = productRepository.save(saved);

        syncProductImages(saved, request.getImages());
        syncProductAttributeValues(saved, request.getAttributeValues());

        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        productValidator.validateId(id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));

        String name = request.getName().trim();
        String sku = normalizeSku(request.getSku());

        if (!name.equals(product.getName())) {
            product.setName(name);
            product.setSlug(buildUniqueSlug(name, id));
        }

        if (sku != null) {
            validateSkuForUpdate(sku, id);
            product.setSku(sku);
        }
        product.setSummary(trimToNull(request.getSummary()));
        product.setDescription(trimToNull(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setStockQuantity(defaultStockQuantity(request.getStockQuantity()));
        product.setIsActive(defaultIsActive(request.getIsActive()));
        product.setCategories(resolveCategories(request.getCategoryIds()));

        Product updated = productRepository.save(product);

        syncProductImages(updated, request.getImages());
        syncProductAttributeValues(updated, request.getAttributeValues());

        return toResponse(updated);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById"}, allEntries = true)
    public void deleteProduct(Long id) {
        productValidator.validateId(id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));

        productImageRepository.deleteByProduct_Id(id);
        productAttributeValueRepository.deleteByProduct_Id(id);

        product.setCategories(new HashSet<>());
        productRepository.save(product);

        productRepository.delete(product);
    }

        private ProductResponse toResponse(Product product) {
        Map<Long, List<ProductImage>> imagesByProduct = new HashMap<>();
        Map<Long, List<ProductAttributeValue>> attributesByProduct = new HashMap<>();

        imagesByProduct.put(product.getId(), productImageRepository
            .findByProduct_IdOrderBySortOrderAscIdAsc(product.getId()));
        attributesByProduct.put(product.getId(), productAttributeValueRepository
            .findByProduct_IdOrderByAttribute_IdAsc(product.getId()));

        return toResponse(product, imagesByProduct, attributesByProduct);
        }

        private ProductResponse toResponse(
            Product product,
            Map<Long, List<ProductImage>> imagesByProduct,
            Map<Long, List<ProductAttributeValue>> attributesByProduct) {
        List<ProductResponse.ProductCategoryItemResponse> categories = product.getCategories().stream()
                .sorted(Comparator.comparing(Category::getId))
                .map(category -> ProductResponse.ProductCategoryItemResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .build())
                .collect(Collectors.toList());

        List<ProductResponse.ProductImageItemResponse> images = imagesByProduct
            .getOrDefault(product.getId(), List.of())
            .stream()
                .map(image -> ProductResponse.ProductImageItemResponse.builder()
                        .id(image.getId())
                        .imageUrl(image.getImageUrl())
                        .isMain(Boolean.TRUE.equals(image.getIsMain()))
                        .sortOrder(image.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        List<ProductResponse.ProductAttributeValueItemResponse> attributeValues = attributesByProduct
            .getOrDefault(product.getId(), List.of())
            .stream()
                .map(value -> ProductResponse.ProductAttributeValueItemResponse.builder()
                        .attributeId(value.getAttribute().getId())
                        .attributeName(value.getAttribute().getName())
                        .attrValue(value.getAttrValue())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .summary(product.getSummary())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .categories(categories)
                .images(images)
                .attributeValues(attributeValues)
                .build();
    }

    private Set<Category> resolveCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new BadRequestException("At least one category is required");
        }

        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(categoryIds);
        List<Category> categories = categoryRepository.findAllById(uniqueIds);

        if (categories.size() != uniqueIds.size()) {
            Set<Long> foundIds = categories.stream().map(Category::getId).collect(Collectors.toSet());
            List<Long> missingIds = uniqueIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new NotFoundException("Category not found with ids: " + missingIds);
        }

        return new LinkedHashSet<>(categories);
    }

    private void syncProductImages(Product product, List<ProductImageRequest> imageRequests) {
        productImageRepository.deleteByProduct_Id(product.getId());

        if (imageRequests == null || imageRequests.isEmpty()) {
            return;
        }

        long mainCount = imageRequests.stream().filter(item -> Boolean.TRUE.equals(item.getIsMain())).count();
        if (mainCount > 1) {
            throw new BadRequestException("Only one main image is allowed");
        }

        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < imageRequests.size(); i++) {
            ProductImageRequest request = imageRequests.get(i);
            String imageUrl = request.getImageUrl().trim();

            images.add(ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .isMain(Boolean.TRUE.equals(request.getIsMain()))
                    .sortOrder(defaultSortOrder(request.getSortOrder(), i))
                    .build());
        }

        productImageRepository.saveAll(images);
    }

    private void syncProductAttributeValues(Product product, List<ProductAttributeValueRequest> attributeValueRequests) {
        productAttributeValueRepository.deleteByProduct_Id(product.getId());

        if (attributeValueRequests == null || attributeValueRequests.isEmpty()) {
            return;
        }

        Set<Long> uniqueAttributeIds = new LinkedHashSet<>();
        for (ProductAttributeValueRequest request : attributeValueRequests) {
            if (!uniqueAttributeIds.add(request.getAttributeId())) {
                throw new BadRequestException("Duplicate attribute ID in attribute values: " + request.getAttributeId());
            }
        }

        List<Attribute> attributes = attributeRepository.findAllById(uniqueAttributeIds);
        if (attributes.size() != uniqueAttributeIds.size()) {
            Set<Long> foundIds = attributes.stream().map(Attribute::getId).collect(Collectors.toSet());
            List<Long> missingIds = uniqueAttributeIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new NotFoundException("Attribute not found with ids: " + missingIds);
        }

        Map<Long, Attribute> attributeById = new HashMap<>();
        for (Attribute attribute : attributes) {
            attributeById.put(attribute.getId(), attribute);
        }

        List<ProductAttributeValue> attributeValues = new ArrayList<>();
        for (ProductAttributeValueRequest request : attributeValueRequests) {
            Long attributeId = request.getAttributeId();
            Attribute attribute = attributeById.get(attributeId);

            attributeValues.add(ProductAttributeValue.builder()
                    .id(new ProductAttributeValueId(product.getId(), attributeId))
                    .product(product)
                    .attribute(attribute)
                    .attrValue(request.getAttrValue().trim())
                    .build());
        }

        productAttributeValueRepository.saveAll(attributeValues);
    }

    private void validateSkuForUpdate(String sku, Long productId) {
        if (sku != null && productRepository.existsBySkuAndIdNot(sku, productId)) {
            throw new BadRequestException("SKU already exists");
        }
    }

    private String buildUniqueSlug(String name, Long excludeProductId) {
        String baseSlug = SlugUtil.toSlug(name);
        String slug = baseSlug;

        if (excludeProductId == null) {
            if (productRepository.existsBySlug(slug)) {
                slug = baseSlug + "-" + System.currentTimeMillis();
            }
            return slug;
        }

        if (productRepository.existsBySlugAndIdNot(slug, excludeProductId)) {
            slug = baseSlug + "-" + System.currentTimeMillis();
        }

        return slug;
    }

    private String normalizeSku(String sku) {
        if (sku == null) {
            return null;
        }

        String normalized = sku.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String buildAutoSku(Long id) {
        return "FS-" + id;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Integer defaultStockQuantity(Integer stockQuantity) {
        return stockQuantity != null ? stockQuantity : 0;
    }

    private Boolean defaultIsActive(Boolean isActive) {
        return isActive != null ? isActive : Boolean.TRUE;
    }

    private Integer defaultSortOrder(Integer sortOrder, int fallback) {
        return sortOrder != null ? sortOrder : fallback;
    }
}
