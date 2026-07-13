package com.fishbreeding.backend.controller;

import com.fishbreeding.backend.dto.ChatRequest;
import com.fishbreeding.backend.dto.ProductResponse;
import com.fishbreeding.backend.service.OpenRouterChatService;
import com.fishbreeding.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final OpenRouterChatService openRouterChatService;
    private final ProductService productService;

    public ChatController(
            OpenRouterChatService openRouterChatService,
            ProductService productService) {
        this.openRouterChatService = openRouterChatService;
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<String> chat(@Valid @RequestBody ChatRequest request) {
        List<ProductResponse> products = productService.getActiveProducts();
        String productListString = buildProductListString(products);
        String systemInstruction = buildSystemInstruction(productListString);
        String answer = openRouterChatService.chat(request.message(), request.history(), systemInstruction);
        return ResponseEntity.ok(answer);
    }

    private String buildSystemInstruction(String productListString) {
        return """
            Bạn là chuyên viên tư vấn bán hàng (nhân viên tư vấn) của cửa hàng cá cảnh FishSync.
            Nhiệm vụ của bạn là giải đáp thắc mắc, tư vấn chọn cá giống và chăm cá, báo giá, báo tình trạng kho hàng dựa TRÊN thông tin danh sách sản phẩm thực tế được cung cấp dưới đây.

            QUY TẮC CỰC KỲ QUAN TRỌNG:
            1. CHỈ được tư vấn, cung cấp thông tin, thuộc tính, và giá cả của các sản phẩm có TRONG danh sách dưới đây.
            2. TUYỆT ĐỐI KHÔNG tự bịa đặt, tưởng tượng ra bất kỳ sản phẩm, dòng cá, kích thước, xuất xứ, thuộc tính hay mức giá nào không có trong danh sách. Nếu khách hỏi sản phẩm hoặc thông tin không có trong danh sách, hãy phản hồi lịch sự rằng cửa hàng hiện tại chưa có loại này hoặc bạn chưa có thông tin cụ thể, khuyên khách chọn các sản phẩm khác đang có sẵn.
            3. Luôn báo chính xác giá cả và tình trạng tồn kho của sản phẩm:
               - Nếu sản phẩm hết hàng (Tồn kho <= 0), hãy báo là "Hiện sản phẩm này đang tạm hết hàng, quý khách có thể đặt hàng trước hoặc tham khảo dòng khác".
               - Nếu sản phẩm còn hàng, hãy báo giá cụ thể.
            4. Trả lời bằng tiếng Việt thân thiện, lịch sự, sử dụng biểu tượng cảm xúc (emoji) phù hợp để tăng tính tương tác.
            5. Giữ câu trả lời ngắn gọn, tập trung đúng vào nhu cầu của khách hàng. Tránh giải thích dài dòng không cần thiết trừ khi khách hỏi sâu về kỹ thuật nuôi hay chăm sóc.
            6. Nếu khách hàng hỏi những câu hỏi ngoài lề (không liên quan đến cá cảnh, phụ kiện hồ cá hay tư vấn sản phẩm của shop), hãy lịch sự từ chối và hướng khách hàng về các sản phẩm/dịch vụ cá cảnh của cửa hàng.

            [DANH SÁCH SẢN PHẨM HIỆN CÓ TRÊN WEBSITE]:
            """ + productListString;
    }

    private String buildProductListString(List<ProductResponse> products) {
        if (products == null || products.isEmpty()) {
            return "- Hiện chưa có sản phẩm nào trên hệ thống để tư vấn.";
        }

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        StringBuilder builder = new StringBuilder();

        for (ProductResponse product : products) {
            builder.append("[SẢN PHẨM]\n");
            builder.append("- Tên sản phẩm: ").append(product.getName()).append("\n");
            if (product.getSku() != null) {
                builder.append("- SKU: ").append(product.getSku()).append("\n");
            }
            if (product.getCategories() != null && !product.getCategories().isEmpty()) {
                builder.append("- Danh mục: ");
                for (int i = 0; i < product.getCategories().size(); i++) {
                    builder.append(product.getCategories().get(i).getName());
                    if (i < product.getCategories().size() - 1) {
                        builder.append(", ");
                    }
                }
                builder.append("\n");
            }
            
            String priceStr = product.getPrice() == null 
                ? "Liên hệ" 
                : currencyFormat.format(product.getPrice());
            builder.append("- Giá bán: ").append(priceStr).append("\n");
            
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            builder.append("- Tồn kho: ").append(stock).append(" con (")
                   .append(stock > 0 ? "Còn hàng" : "Hết hàng")
                   .append(")\n");
            
            if (product.getSummary() != null && !product.getSummary().isBlank()) {
                builder.append("- Tóm tắt: ").append(product.getSummary().trim()).append("\n");
            }
            
            if (product.getDescription() != null && !product.getDescription().isBlank()) {
                builder.append("- Mô tả chi tiết: ").append(product.getDescription().trim()).append("\n");
            }
            
            if (product.getAttributeValues() != null && !product.getAttributeValues().isEmpty()) {
                builder.append("- Thuộc tính chi tiết:\n");
                for (ProductResponse.ProductAttributeValueItemResponse attr : product.getAttributeValues()) {
                    builder.append("  + ").append(attr.getAttributeName()).append(": ").append(attr.getAttrValue()).append("\n");
                }
            }
            builder.append("-----------------------------------\n");
        }

        return builder.toString().trim();
    }
}

