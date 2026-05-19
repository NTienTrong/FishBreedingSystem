package com.fishbreeding.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterChatService {

    private static final Logger logger = LoggerFactory.getLogger(OpenRouterChatService.class);
    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenRouterChatService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Value("${ai.openrouter.api-key:}")
    private String apiKey;

    @Value("${ai.openrouter.model:deepseek/deepseek-chat}")
    private String model;

    public String chat(String userMessage, String systemInstruction) {
        if (!StringUtils.hasText(userMessage)) {
            return "Bạn hãy nhập câu hỏi về cá giống nhé 😊";
        }

        if (!StringUtils.hasText(apiKey)) {
            return "Hiện tại chatbot chưa được cấu hình API key OpenRouter. Vui lòng liên hệ quản trị viên FishSync. 🙏";
        }

        try {
            String requestBody = objectMapper.writeValueAsString(buildRequest(userMessage.trim(), systemInstruction));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_URL, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || !StringUtils.hasText(response.getBody())) {
                return "FishSync chưa nhận được phản hồi từ OpenRouter lúc này. Bạn thử lại giúp mình nhé 😊";
            }

            return extractText(response.getBody());
        } catch (RestClientException ex) {
            logger.error("OpenRouter API request failed: {}", ex.getMessage(), ex);
            return "FishSync đang bận xử lý, bạn thử lại sau ít phút nhé 😊";
        } catch (Exception ex) {
            logger.error("Chat service error: {}", ex.getMessage(), ex);
            return "FishSync chưa xử lý được câu hỏi này ngay lúc này. Bạn thử lại giúp mình nhé 😊";
        }
    }

    private Map<String, Object> buildRequest(String userMessage, String systemInstruction) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", List.of(
            Map.of("role", "system", "content", systemInstruction),
            Map.of("role", "user", "content", userMessage)
        ));
        payload.put("temperature", 0.2);
        payload.put("top_p", 0.95);
        payload.put("max_tokens", 256);

        return payload;
    }

    private String extractText(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            return "FishSync chưa nhận được phản hồi hợp lệ từ OpenRouter. Bạn thử lại nhé 😊";
        }

        JsonNode content = choices.path(0).path("message").path("content");
        if (!content.isTextual()) {
            return "FishSync chưa nhận được phản hồi hợp lệ từ OpenRouter. Bạn thử lại nhé 😊";
        }

        String result = content.asText().trim();
        return StringUtils.hasText(result)
            ? result
            : "FishSync chưa nhận được phản hồi hợp lệ từ OpenRouter. Bạn thử lại nhé 😊";
    }
}
