package com.fishbreeding.backend.controller;

import com.fishbreeding.backend.dto.ChatRequest;
import com.fishbreeding.backend.entity.Product;
import com.fishbreeding.backend.entity.ProductAttributeValue;
import com.fishbreeding.backend.repository.ProductAttributeValueRepository;
import com.fishbreeding.backend.repository.ProductRepository;
import com.fishbreeding.backend.service.OpenRouterChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final OpenRouterChatService openRouterChatService;
    private final ProductRepository productRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;

    public ChatController(
            OpenRouterChatService openRouterChatService,
            ProductRepository productRepository,
            ProductAttributeValueRepository productAttributeValueRepository) {
        this.openRouterChatService = openRouterChatService;
        this.productRepository = productRepository;
        this.productAttributeValueRepository = productAttributeValueRepository;
    }

    @PostMapping
    public ResponseEntity<String> chat(@Valid @RequestBody ChatRequest request) {
        List<Product> products = productRepository.findByIsActiveTrue();
        String productListString = buildProductListString(products);
        String systemInstruction = buildSystemInstruction(productListString);
        String answer = openRouterChatService.chat(request.message(), systemInstruction);
        return ResponseEntity.ok(answer);
    }

    private String buildSystemInstruction(String productListString) {
        return """
            Bạn là nhân viên tư vấn của FishSync. CHỈ ĐƯỢC PHÉP báo giá và bán các sản phẩm có trong danh sách dưới đây. Tuyệt đối không bịa đặt sản phẩm không có thực. Nếu khách hỏi ngoài lề, hãy từ chối lịch sự.

            [DANH SÁCH SẢN PHẨM HIỆN CÓ]:
            """ + productListString;
    }

    private String buildProductListString(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return "- Hiện chưa có sản phẩm để tư vấn.";
        }

        List<Long> productIds = products.stream().map(Product::getId).toList();
        Map<Long, String> sizeByProduct = buildSizeMap(productIds);
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        StringBuilder builder = new StringBuilder();
        for (Product product : products) {
            String size = sizeByProduct.getOrDefault(product.getId(), "Không rõ kích thước");
            String price = product.getPrice() == null
                ? "Liên hệ"
                : currencyFormat.format(product.getPrice());
            builder.append("- ")
                .append(product.getName())
                .append(" - ")
                .append(size)
                .append(" - ")
                .append(price)
                .append("\n");
        }

        return builder.toString().trim();
    }

    private Map<Long, String> buildSizeMap(List<Long> productIds) {
        Map<Long, String> sizeByProduct = new HashMap<>();
        if (productIds == null || productIds.isEmpty()) {
            return sizeByProduct;
        }

        List<ProductAttributeValue> values = productAttributeValueRepository
            .findByProduct_IdInOrderByAttribute_IdAsc(productIds);

        for (ProductAttributeValue value : values) {
            if (value.getAttribute() == null || value.getAttribute().getName() == null) {
                continue;
            }
            String attributeName = value.getAttribute().getName().toLowerCase(Locale.ROOT);
            if (!isSizeAttribute(attributeName)) {
                continue;
            }

            Long productId = value.getProduct().getId();
            if (!sizeByProduct.containsKey(productId)) {
                sizeByProduct.put(productId, value.getAttrValue());
            }
        }

        return sizeByProduct;
    }

    private boolean isSizeAttribute(String attributeName) {
        return attributeName.contains("kích thước")
            || attributeName.contains("kich thuoc")
            || attributeName.contains("size");
    }
}
