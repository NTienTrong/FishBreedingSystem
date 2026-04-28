package com.fishbreeding.backend.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.CustomerAddressRequest;
import com.fishbreeding.backend.dto.CustomerAddressResponse;
import com.fishbreeding.backend.dto.CustomerAttributeValueResponse;
import com.fishbreeding.backend.dto.CustomerFishRecordResponse;
import com.fishbreeding.backend.dto.CustomerOrderItemResponse;
import com.fishbreeding.backend.dto.CustomerOrderResponse;
import com.fishbreeding.backend.dto.CustomerWishlistItemResponse;
import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.OrderItem;
import com.fishbreeding.backend.entity.Product;
import com.fishbreeding.backend.entity.ProductImage;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.entity.UserAddress;
import com.fishbreeding.backend.entity.WishlistItem;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.OrderItemRepository;
import com.fishbreeding.backend.repository.OrderRepository;
import com.fishbreeding.backend.repository.ProductAttributeValueRepository;
import com.fishbreeding.backend.repository.ProductImageRepository;
import com.fishbreeding.backend.repository.ProductRepository;
import com.fishbreeding.backend.repository.UserAddressRepository;
import com.fishbreeding.backend.repository.UserRepository;
import com.fishbreeding.backend.repository.WishlistItemRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerPortalController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserAddressRepository userAddressRepository;

    @GetMapping("/orders")
    public ResponseEntity<List<CustomerOrderResponse>> listOrders(java.security.Principal principal) {
        User user = requireUser(principal);
        List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDescIdDesc(user.getId());
        List<CustomerOrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(mapOrder(order));
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/fish-records")
    public ResponseEntity<List<CustomerFishRecordResponse>> listFishRecords(java.security.Principal principal) {
        User user = requireUser(principal);
        List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDescIdDesc(user.getId());
        List<CustomerFishRecordResponse> records = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
            for (OrderItem item : items) {
                Product product = item.getProduct();
                String imageUrl = resolveProductImage(product.getId());
                List<CustomerAttributeValueResponse> attributes = productAttributeValueRepository
                        .findByProduct_IdOrderByAttribute_IdAsc(product.getId())
                        .stream()
                        .map(attr -> CustomerAttributeValueResponse.builder()
                                .attributeName(attr.getAttribute().getName())
                                .value(attr.getAttrValue())
                                .build())
                        .toList();

                records.add(CustomerFishRecordResponse.builder()
                        .productId(product.getId())
                        .name(product.getName())
                        .imageUrl(imageUrl)
                        .purchasedAt(order.getCreatedAt())
                        .attributes(attributes)
                        .certificateUrl(null)
                        .build());
            }
        }

        return ResponseEntity.ok(records);
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<CustomerWishlistItemResponse>> listWishlist(java.security.Principal principal) {
        User user = requireUser(principal);
        List<WishlistItem> items = wishlistItemRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        List<CustomerWishlistItemResponse> responses = new ArrayList<>();

        for (WishlistItem item : items) {
            Product product = item.getProduct();
            responses.add(CustomerWishlistItemResponse.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .sku(product.getSku())
                    .price(product.getPrice())
                    .stockQuantity(product.getStockQuantity())
                    .imageUrl(resolveProductImage(product.getId()))
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/wishlist")
    public ResponseEntity<CustomerWishlistItemResponse> addToWishlist(
            java.security.Principal principal,
            @RequestBody java.util.Map<String, Long> request) {
        User user = requireUser(principal);
        Long productId = request.get("productId");
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));

        Optional<WishlistItem> existing = wishlistItemRepository.findByUser_IdAndProduct_Id(user.getId(), productId);
        WishlistItem item = existing.orElseGet(() -> wishlistItemRepository.save(WishlistItem.builder()
                .user(user)
                .product(product)
                .build()));

        return ResponseEntity.ok(CustomerWishlistItemResponse.builder()
                .productId(item.getProduct().getId())
                .name(item.getProduct().getName())
                .sku(item.getProduct().getSku())
                .price(item.getProduct().getPrice())
                .stockQuantity(item.getProduct().getStockQuantity())
                .imageUrl(resolveProductImage(item.getProduct().getId()))
                .build());
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<?> removeWishlist(java.security.Principal principal, @PathVariable Long productId) {
        User user = requireUser(principal);
        wishlistItemRepository.deleteByUser_IdAndProduct_Id(user.getId(), productId);
        return ResponseEntity.ok(java.util.Map.of("message", "Removed"));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<CustomerAddressResponse>> listAddresses(java.security.Principal principal) {
        User user = requireUser(principal);
        List<UserAddress> addresses = userAddressRepository.findByUser_IdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        List<CustomerAddressResponse> responses = addresses.stream()
                .map(address -> CustomerAddressResponse.builder()
                        .id(address.getId())
                        .label(address.getLabel())
                        .phone(address.getPhone())
                        .address(address.getAddress())
                        .isDefault(address.getIsDefault())
                        .build())
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/addresses")
    public ResponseEntity<CustomerAddressResponse> createAddress(
            java.security.Principal principal,
            @Valid @RequestBody CustomerAddressRequest request) {
        User user = requireUser(principal);
        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.getLabel())
                .phone(request.getPhone())
                .address(request.getAddress())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefault(user.getId());
        }

        UserAddress saved = userAddressRepository.save(address);
        return ResponseEntity.ok(toAddressResponse(saved));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<CustomerAddressResponse> updateAddress(
            java.security.Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody CustomerAddressRequest request) {
        User user = requireUser(principal);
        UserAddress address = userAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));

        address.setLabel(request.getLabel());
        address.setPhone(request.getPhone());
        address.setAddress(request.getAddress());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefault(user.getId());
            address.setIsDefault(true);
        }

        UserAddress saved = userAddressRepository.save(address);
        return ResponseEntity.ok(toAddressResponse(saved));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<?> setDefaultAddress(java.security.Principal principal, @PathVariable Long id) {
        User user = requireUser(principal);
        UserAddress address = userAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));

        unsetDefault(user.getId());
        address.setIsDefault(true);
        userAddressRepository.save(address);
        return ResponseEntity.ok(java.util.Map.of("message", "Default updated"));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(java.security.Principal principal, @PathVariable Long id) {
        User user = requireUser(principal);
        UserAddress address = userAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));
        userAddressRepository.delete(address);
        return ResponseEntity.ok(java.util.Map.of("message", "Deleted"));
    }

    private User requireUser(java.security.Principal principal) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            throw new BadRequestException("Unauthorized");
        }

        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private CustomerOrderResponse mapOrder(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
        List<CustomerOrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem item : items) {
            Product product = item.getProduct();
            BigDecimal price = item.getPriceAtPurchase();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            itemResponses.add(CustomerOrderItemResponse.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .sku(product.getSku())
                    .imageUrl(resolveProductImage(product.getId()))
                    .quantity(item.getQuantity())
                    .price(price)
                    .lineTotal(lineTotal)
                    .build());
        }

        return CustomerOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    private String resolveProductImage(Long productId) {
        return productImageRepository.findByProduct_IdOrderBySortOrderAscIdAsc(productId)
                .stream()
                .sorted((a, b) -> Boolean.compare(!a.getIsMain(), !b.getIsMain()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);
    }

    private CustomerAddressResponse toAddressResponse(UserAddress address) {
        return CustomerAddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .phone(address.getPhone())
                .address(address.getAddress())
                .isDefault(address.getIsDefault())
                .build();
    }

    private void unsetDefault(Long userId) {
        List<UserAddress> addresses = userAddressRepository.findByUser_IdOrderByIsDefaultDescCreatedAtDesc(userId);
        for (UserAddress address : addresses) {
            if (Boolean.TRUE.equals(address.getIsDefault())) {
                address.setIsDefault(false);
            }
        }
        userAddressRepository.saveAll(addresses);
    }
}
