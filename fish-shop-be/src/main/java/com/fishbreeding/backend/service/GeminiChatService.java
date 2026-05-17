package com.fishbreeding.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiChatService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiChatService.class);
    private static final String SYSTEM_PROMPT = "Bạn là nhân viên tư vấn bán hàng nhiệt tình và chuyên nghiệp của trại cá giống FishSync. Nhiệm vụ của bạn là: Tư vấn các giống cá cảnh (Koi Kohaku, Showa, cá vàng...), báo giá và hướng dẫn kỹ thuật chăm sóc hồ cá cơ bản. Khuyến khích khách hàng mua hàng. Trả lời cực kỳ ngắn gọn, thân thiện, dùng emoji. Tuyệt đối KHÔNG trả lời các câu hỏi không liên quan đến cá cảnh, thủy sinh hoặc mua sắm.";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiChatService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    public String chat(String userMessage) {
        if (!StringUtils.hasText(userMessage)) {
            return "Bạn hãy nhập câu hỏi về cá giống nhé 😊";
        }

        if (!StringUtils.hasText(apiKey)) {
            return "Hiện tại chatbot chưa được cấu hình API key Gemini. Vui lòng liên hệ quản trị viên FishSync. 🙏";
        }

        try {
            String requestBody = objectMapper.writeValueAsString(buildRequest(userMessage.trim()));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            // Use gemini-2.0-flash-exp which is the available model from Gemini API free tier
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + apiKey;

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || !StringUtils.hasText(response.getBody())) {
                return "FishSync chưa nhận được phản hồi từ Gemini lúc này. Bạn thử lại giúp mình nhé 😊";
            }

            return extractText(response.getBody());
        } catch (RestClientException ex) {
            logger.error("Gemini API request failed: {}", ex.getMessage(), ex);
            return "FishSync đang bận xử lý, bạn thử lại sau ít phút nhé 😊";
        } catch (Exception ex) {
            logger.error("Chat service error: {}", ex.getMessage(), ex);
            return "FishSync chưa xử lý được câu hỏi này ngay lúc này. Bạn thử lại giúp mình nhé 😊";
        }
    }

    private Map<String, Object> buildRequest(String userMessage) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(
            Map.of(
                "role", "user",
                "parts", List.of(
                    Map.of("text", SYSTEM_PROMPT + "\n\n" + userMessage)
                )
            )
        ));

        payload.put("generationConfig", Map.of(
            "temperature", 0.7,
            "topP", 0.95,
            "maxOutputTokens", 256
        ));

        return payload;
    }

    private String extractText(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return "FishSync chưa nhận được phản hồi hợp lệ từ Gemini. Bạn thử lại nhé 😊";
        }

        JsonNode parts = candidates.path(0).path("content").path("parts");
        if (!parts.isArray() || parts.isEmpty()) {
            return "FishSync chưa nhận được phản hồi hợp lệ từ Gemini. Bạn thử lại nhé 😊";
        }

        StringBuilder answer = new StringBuilder();
        for (JsonNode part : parts) {
            if (part.hasNonNull("text")) {
                answer.append(part.get("text").asText());
            }
        }

        String result = answer.toString().trim();
        return StringUtils.hasText(result)
            ? result
            : "FishSync chưa nhận được phản hồi hợp lệ từ Gemini. Bạn thử lại nhé 😊";
    }
}
