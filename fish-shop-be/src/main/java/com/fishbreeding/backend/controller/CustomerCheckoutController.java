package com.fishbreeding.backend.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.CustomerCheckoutRequest;
import com.fishbreeding.backend.dto.CustomerCheckoutResponse;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.service.VnpayCheckoutService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/customer/checkout/vnpay")
@RequiredArgsConstructor
@Slf4j
public class CustomerCheckoutController {

    private final VnpayCheckoutService vnpayCheckoutService;

    @PostMapping
    public ResponseEntity<CustomerCheckoutResponse> createCheckout(
            Principal principal,
            @Valid @RequestBody CustomerCheckoutRequest request) {

        if (principal == null) {
            log.warn("Unauthorized checkout");
            throw new BadRequestException("Unauthorized");
        }

        log.info("Checkout request user={}", principal.getName());

        return ResponseEntity.ok(
                vnpayCheckoutService.createCheckout(principal.getName(), request));
    }

    @GetMapping("/return")
    public void handleReturn(@RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        log.info("VNPay RETURN params={}", params);

        VnpayCheckoutService.CallbackResult result = vnpayCheckoutService.handleReturn(params);

        String redirectUrl = result.redirectUrl();

        if (redirectUrl == null) {
            redirectUrl = "http://localhost:3000/payment-error";
        }

        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(
            @RequestParam Map<String, String> params) {

        log.info("VNPay IPN params={}", params);

        VnpayCheckoutService.CallbackResult result = vnpayCheckoutService.handleIpn(params);

        if (result.success()) {
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Confirm Success"));
        } else {
            return ResponseEntity.ok(Map.of(
                    "RspCode", "97",
                    "Message", "Invalid Signature"));
        }
    }
}