package com.fishbreeding.backend.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.CustomerAddressRequest;
import com.fishbreeding.backend.dto.CustomerAddressResponse;
import com.fishbreeding.backend.dto.CustomerAttributeValueResponse;
import com.fishbreeding.backend.dto.CustomerCartItemRequest;
import com.fishbreeding.backend.dto.CustomerCartItemResponse;
import com.fishbreeding.backend.dto.CustomerCartSyncRequest;
import com.fishbreeding.backend.dto.CustomerFishRecordResponse;
import com.fishbreeding.backend.dto.CustomerOrderDetailResponse;
import com.fishbreeding.backend.dto.CustomerOrderItemResponse;
import com.fishbreeding.backend.dto.CustomerOrderResponse;
import com.fishbreeding.backend.dto.CustomerWishlistItemResponse;
import com.fishbreeding.backend.entity.CartItem;
import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.OrderItem;
import com.fishbreeding.backend.entity.Product;
import com.fishbreeding.backend.entity.ProductImage;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.entity.UserAddress;
import com.fishbreeding.backend.entity.WishlistItem;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.CartItemRepository;
import com.fishbreeding.backend.service.GhnLocationService;
import com.fishbreeding.backend.repository.OrderRepository;
import com.fishbreeding.backend.repository.ProductAttributeValueRepository;
import com.fishbreeding.backend.repository.ProductImageRepository;
import com.fishbreeding.backend.repository.ProductRepository;
import com.fishbreeding.backend.repository.UserAddressRepository;
import com.fishbreeding.backend.repository.UserRepository;
import com.fishbreeding.backend.repository.WishlistItemRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerPortalController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserAddressRepository userAddressRepository;
    private final CartItemRepository cartItemRepository;
    private final GhnLocationService ghnLocationService;

    @GetMapping("/orders")
    public ResponseEntity<List<CustomerOrderResponse>> listOrders(java.security.Principal principal) {
        User user = requireUser(principal);
        List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDescIdDesc(user.getId());
        List<CustomerOrderResponse> responses = new ArrayList<>();

        // collect product ids used by these orders and batch-load related collections
        Set<Long> productIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(i -> i.getProduct().getId())
                .collect(Collectors.toSet());

        Map<Long, String> imageMap = loadMainImageMap(productIds);
        Map<Long, List<CustomerAttributeValueResponse>> attributeMap = loadAttributeValuesMap(productIds);

        for (Order order : orders) {
            responses.add(mapOrder(order, imageMap, attributeMap));
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/orders/{orderCode}")
    public ResponseEntity<CustomerOrderDetailResponse> getOrderDetail(
            java.security.Principal principal,
            @PathVariable String orderCode) {
        User user = requireUser(principal);
        Order order = orderRepository.findWithUserByOrderCode(orderCode)
            .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized");
        }

        Set<Long> productIds = order.getItems().stream()
            .map(i -> i.getProduct().getId())
            .collect(Collectors.toSet());

        Map<Long, String> imageMap = loadMainImageMap(productIds);
        Map<Long, List<CustomerAttributeValueResponse>> attributeMap = loadAttributeValuesMap(productIds);

        CustomerOrderResponse baseResponse = mapOrder(order, imageMap, attributeMap);
        CustomerOrderDetailResponse detailResponse = CustomerOrderDetailResponse.builder()
            .id(baseResponse.getId())
            .orderCode(baseResponse.getOrderCode())
            .orderStatus(baseResponse.getOrderStatus())
            .totalAmount(baseResponse.getTotalAmount())
            .createdAt(baseResponse.getCreatedAt())
            .paymentStatus(order.getPaymentStatus())
            .paymentMethod(order.getPaymentMethod())
            .shippingFee(order.getShippingFee())
            .recipientName(order.getRecipientName())
            .recipientPhone(order.getRecipientPhone())
            .shippingAddress(order.getShippingAddress())
            .orderNote(order.getOrderNote())
            .cancelReason(order.getCancelReason())
            .items(baseResponse.getItems())
            .build();

        return ResponseEntity.ok(detailResponse);
    }

    @GetMapping("/orders/{orderCode}/tracking")
    public ResponseEntity<?> getOrderTracking(java.security.Principal principal, @PathVariable String orderCode) {
        User user = requireUser(principal);
        Order order = orderRepository.findWithUserByOrderCode(orderCode)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized");
        }

        String ghnOrderCode = order.getGhnOrderCode();
        if (!StringUtils.hasText(ghnOrderCode)) {
            return ResponseEntity.ok(java.util.Map.of(
                "orderCode", order.getOrderCode(),
                "status", order.getOrderStatus().toString(),
                "ghnOrderCode", "",
                "trackingData", java.util.Map.of("message", "Đơn hàng chưa được bàn giao cho đơn vị vận chuyển GHN.")
            ));
        }

        Object ghnDetail = ghnLocationService.getOrderTrackingDetail(ghnOrderCode);
        return ResponseEntity.ok(java.util.Map.of(
            "orderCode", order.getOrderCode(),
            "status", order.getOrderStatus().toString(),
            "ghnOrderCode", ghnOrderCode,
            "trackingData", ghnDetail != null ? ghnDetail : java.util.Map.of()
        ));
    }

    @GetMapping("/fish-records")
    public ResponseEntity<List<CustomerFishRecordResponse>> listFishRecords(java.security.Principal principal) {
        User user = requireUser(principal);
        List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDescIdDesc(user.getId());
        List<CustomerFishRecordResponse> records = new ArrayList<>();

        Set<Long> productIds = orders.stream()
            .flatMap(o -> o.getItems().stream())
            .map(i -> i.getProduct().getId())
            .collect(Collectors.toSet());

        Map<Long, String> imageMap = loadMainImageMap(productIds);
        Map<Long, List<CustomerAttributeValueResponse>> attributeMap = loadAttributeValuesMap(productIds);

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            String imageUrl = imageMap.get(product.getId());
            List<CustomerAttributeValueResponse> attributes = attributeMap.getOrDefault(product.getId(), List.of());

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

        Set<Long> productIds = items.stream().map(i -> i.getProduct().getId()).collect(Collectors.toSet());
        Map<Long, String> imageMap = loadMainImageMap(productIds);

        for (WishlistItem item : items) {
            Product product = item.getProduct();
            responses.add(CustomerWishlistItemResponse.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .slug(product.getSlug())
                    .sku(product.getSku())
                    .price(product.getPrice())
                    .stockQuantity(product.getStockQuantity())
                    .imageUrl(imageMap.get(product.getId()))
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
                .slug(item.getProduct().getSlug())
                .sku(item.getProduct().getSku())
                .price(item.getProduct().getPrice())
                .stockQuantity(item.getProduct().getStockQuantity())
                .imageUrl(resolveProductImage(item.getProduct().getId()))
                .build());
    }

    @Transactional
    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<?> removeWishlist(java.security.Principal principal, @PathVariable Long productId) {
        User user = requireUser(principal);
        wishlistItemRepository.deleteByUser_IdAndProduct_Id(user.getId(), productId);
        return ResponseEntity.ok(java.util.Map.of("message", "Removed"));
    }

    @GetMapping("/cart")
    public ResponseEntity<List<CustomerCartItemResponse>> listCart(java.security.Principal principal) {
        User user = requireUser(principal);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @PostMapping("/cart")
    public ResponseEntity<List<CustomerCartItemResponse>> addToCart(
            java.security.Principal principal,
            @RequestBody CustomerCartItemRequest request) {
        User user = requireUser(principal);
        Long productId = request != null ? request.getProductId() : null;
        Integer quantity = request != null && request.getQuantity() != null ? request.getQuantity() : 1;

        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));

        CartItem item = cartItemRepository.findByUser_IdAndProduct_Id(user.getId(), productId)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + quantity);
                    return existing;
                })
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(quantity)
                        .build());

        cartItemRepository.save(item);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @Transactional
    @PutMapping("/cart/{productId}")
    public ResponseEntity<List<CustomerCartItemResponse>> updateCartItem(
            java.security.Principal principal,
            @PathVariable Long productId,
            @RequestBody CustomerCartItemRequest request) {
        User user = requireUser(principal);
        Integer quantity = request != null ? request.getQuantity() : null;

        if (quantity == null) {
            throw new BadRequestException("Quantity is required");
        }

        if (quantity <= 0) {
            cartItemRepository.deleteByUser_IdAndProduct_Id(user.getId(), productId);
            return ResponseEntity.ok(buildCartResponse(user));
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));

        CartItem item = cartItemRepository.findByUser_IdAndProduct_Id(user.getId(), productId)
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(0)
                        .build());

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @Transactional
    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<List<CustomerCartItemResponse>> removeCartItem(
            java.security.Principal principal,
            @PathVariable Long productId) {
        User user = requireUser(principal);
        cartItemRepository.deleteByUser_IdAndProduct_Id(user.getId(), productId);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @Transactional
    @DeleteMapping("/cart")
    public ResponseEntity<List<CustomerCartItemResponse>> clearCart(java.security.Principal principal) {
        User user = requireUser(principal);
        cartItemRepository.deleteByUser_Id(user.getId());
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/cart/sync")
    public ResponseEntity<List<CustomerCartItemResponse>> syncCart(
            java.security.Principal principal,
            @RequestBody CustomerCartSyncRequest request) {
        User user = requireUser(principal);
        List<CustomerCartItemRequest> items = request != null ? request.getItems() : null;

        if (items == null || items.isEmpty()) {
            return ResponseEntity.ok(buildCartResponse(user));
        }

        for (CustomerCartItemRequest entry : items) {
            Long productId = entry != null ? entry.getProductId() : null;
            Integer quantity = entry != null ? entry.getQuantity() : null;

            if (productId == null) {
                throw new BadRequestException("Product ID is required");
            }

            if (quantity == null || quantity <= 0) {
                continue;
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new BadRequestException("Product not found"));

            CartItem item = cartItemRepository.findByUser_IdAndProduct_Id(user.getId(), productId)
                    .map(existing -> {
                        existing.setQuantity(existing.getQuantity() + quantity);
                        return existing;
                    })
                    .orElseGet(() -> CartItem.builder()
                            .user(user)
                            .product(product)
                            .quantity(quantity)
                            .build());

            cartItemRepository.save(item);
        }

        return ResponseEntity.ok(buildCartResponse(user));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<CustomerAddressResponse>> listAddresses(java.security.Principal principal) {
        User user = requireUser(principal);
        List<UserAddress> addresses = userAddressRepository
                .findByUser_IdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        List<CustomerAddressResponse> responses = addresses.stream()
                .map(address -> CustomerAddressResponse.builder()
                        .id(address.getId())
                .receiverName(address.getReceiverName())
                .phoneNumber(address.getPhoneNumber())
                .provinceId(address.getProvinceId())
                .districtId(address.getDistrictId())
                .wardCode(address.getWardCode())
                .provinceName(address.getProvinceName())
                .districtName(address.getDistrictName())
                .wardName(address.getWardName())
                .streetAddress(address.getStreetAddress())
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
        boolean isFirstAddress = userAddressRepository.countByUser_Id(user.getId()) == 0;
        boolean makeDefault = isFirstAddress || Boolean.TRUE.equals(request.getIsDefault());

        UserAddress address = UserAddress.builder()
                .user(user)
            .receiverName(request.getReceiverName())
            .phoneNumber(request.getPhoneNumber())
            .provinceId(request.getProvinceId())
            .districtId(request.getDistrictId())
            .wardCode(request.getWardCode())
            .provinceName(request.getProvinceName())
            .districtName(request.getDistrictName())
            .wardName(request.getWardName())
            .streetAddress(request.getStreetAddress())
            .isDefault(makeDefault)
                .build();

        if (makeDefault) {
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

        address.setReceiverName(request.getReceiverName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setProvinceId(request.getProvinceId());
        address.setDistrictId(request.getDistrictId());
        address.setWardCode(request.getWardCode());
        address.setProvinceName(request.getProvinceName());
        address.setDistrictName(request.getDistrictName());
        address.setWardName(request.getWardName());
        address.setStreetAddress(request.getStreetAddress());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefault(user.getId());
            address.setIsDefault(true);
        }

        UserAddress saved = userAddressRepository.save(address);
        return ResponseEntity.ok(toAddressResponse(saved));
    }

    @Transactional
    @PatchMapping("/addresses/{id}/default")
    public ResponseEntity<?> setDefaultAddress(java.security.Principal principal, @PathVariable Long id) {
        User user = requireUser(principal);
        UserAddress address = userAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));

        unsetDefault(user.getId());
        address.setIsDefault(true);
        userAddressRepository.save(address);
        return ResponseEntity.ok(java.util.Map.of("message", "Default updated"));
    }

    @Transactional
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(java.security.Principal principal, @PathVariable Long id) {
        User user = requireUser(principal);
        UserAddress address = userAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));

        long addressCount = userAddressRepository.countByUser_Id(user.getId());
        if (addressCount <= 1) {
            throw new BadRequestException("Không thể xóa địa chỉ duy nhất.");
        }

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            throw new BadRequestException("Vui lòng chọn địa chỉ mặc định khác trước khi xóa.");
        }

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

    private CustomerOrderResponse mapOrder(Order order, Map<Long, String> imageMap, Map<Long, List<CustomerAttributeValueResponse>> attributeMap) {
        List<CustomerOrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            BigDecimal price = item.getPriceAtPurchase();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            itemResponses.add(CustomerOrderItemResponse.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .sku(product.getSku())
                    .imageUrl(imageMap.get(product.getId()))
                    .quantity(item.getQuantity())
                    .price(price)
                    .lineTotal(lineTotal)
                    .build());
        }

        return CustomerOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .ghnOrderCode(order.getGhnOrderCode())
                .orderStatus(order.getOrderStatus())
            .paymentMethod(order.getPaymentMethod())
            .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .latitude(order.getLatitude())
                .longitude(order.getLongitude())
                .items(itemResponses)
                .build();
    }

    private String resolveProductImage(Long productId) {
        // fallback single-load method; prefer batch methods
        return productImageRepository.findByProduct_IdOrderBySortOrderAscIdAsc(productId)
                .stream()
                .sorted((a, b) -> Boolean.compare(!a.getIsMain(), !b.getIsMain()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);
    }

    private Map<Long, String> loadMainImageMap(java.util.Collection<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }

        List<ProductImage> images = productImageRepository.findByProduct_IdInOrderBySortOrderAscIdAsc(new java.util.ArrayList<>(productIds));
        Map<Long, List<ProductImage>> grouped = images.stream().collect(Collectors.groupingBy(pi -> pi.getProduct().getId()));

        Map<Long, String> result = new HashMap<>();
        for (var entry : grouped.entrySet()) {
            List<ProductImage> list = entry.getValue();
            // choose main image if exists, otherwise first
            String url = list.stream()
                    .sorted((a, b) -> Boolean.compare(!a.getIsMain(), !b.getIsMain()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(null);
            result.put(entry.getKey(), url);
        }

        return result;
    }

    private Map<Long, List<CustomerAttributeValueResponse>> loadAttributeValuesMap(java.util.Collection<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }

        List<com.fishbreeding.backend.entity.ProductAttributeValue> attrs = productAttributeValueRepository
                .findByProduct_IdInOrderByAttribute_IdAsc(new java.util.ArrayList<>(productIds));

        return attrs.stream()
                .collect(Collectors.groupingBy(a -> a.getProduct().getId(),
                        Collectors.mapping(a -> CustomerAttributeValueResponse.builder()
                                .attributeName(a.getAttribute().getName())
                                .value(a.getAttrValue())
                                .build(),
                                Collectors.toList())));
    }

    private CustomerAddressResponse toAddressResponse(UserAddress address) {
        return CustomerAddressResponse.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .phoneNumber(address.getPhoneNumber())
                .provinceId(address.getProvinceId())
                .districtId(address.getDistrictId())
                .wardCode(address.getWardCode())
                .provinceName(address.getProvinceName())
                .districtName(address.getDistrictName())
                .wardName(address.getWardName())
                .streetAddress(address.getStreetAddress())
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

    private List<CustomerCartItemResponse> buildCartResponse(User user) {
        List<CartItem> items = cartItemRepository.findByUserIdWithProduct(user.getId());
        Set<Long> productIds = items.stream().map(i -> i.getProduct().getId()).collect(Collectors.toSet());
        Map<Long, String> imageMap = loadMainImageMap(productIds);

        return items.stream()
            .map(i -> mapCartItem(i, imageMap))
            .toList();
    }

        private CustomerCartItemResponse mapCartItem(CartItem item, Map<Long, String> imageMap) {
        Product product = item.getProduct();
        return CustomerCartItemResponse.builder()
            .productId(product.getId())
            .name(product.getName())
            .sku(product.getSku())
            .price(product.getPrice())
            .imageUrl(imageMap.get(product.getId()))
            .quantity(item.getQuantity())
            .build();
        }
}
