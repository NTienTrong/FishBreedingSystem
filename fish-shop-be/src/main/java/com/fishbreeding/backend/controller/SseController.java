package com.fishbreeding.backend.controller;

import com.fishbreeding.backend.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @GetMapping(value = "/orders/{orderCode}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrder(@PathVariable String orderCode) {
        String topic = "order:" + orderCode;
        return sseService.subscribe(topic);
    }

    @GetMapping(value = "/admin", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAdmin() {
        return sseService.subscribe("admin");
    }

    @GetMapping(value = "/coupons", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCoupons() {
        return sseService.subscribe("coupon");
    }
}
