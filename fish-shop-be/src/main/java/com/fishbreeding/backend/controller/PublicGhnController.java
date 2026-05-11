package com.fishbreeding.backend.controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.ghn.GhnDistrictResponse;
import com.fishbreeding.backend.dto.ghn.GhnProvinceResponse;
import com.fishbreeding.backend.dto.ghn.GhnWardResponse;
import com.fishbreeding.backend.dto.ghn.GhnShippingFeeResponse;
import com.fishbreeding.backend.service.GhnLocationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/ghn")
@RequiredArgsConstructor
public class PublicGhnController {

    private final GhnLocationService ghnLocationService;

    @GetMapping("/provinces")
    public ResponseEntity<List<GhnProvinceResponse>> getProvinces() {
        return ResponseEntity.ok(ghnLocationService.getProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<GhnDistrictResponse>> getDistricts(@RequestParam int provinceId) {
        return ResponseEntity.ok(ghnLocationService.getDistricts(provinceId));
    }

    @GetMapping("/wards")
    public ResponseEntity<List<GhnWardResponse>> getWards(@RequestParam int districtId) {
        return ResponseEntity.ok(ghnLocationService.getWards(districtId));
    }

    @GetMapping("/shipping-fee")
    public ResponseEntity<Map<String, Object>> getShippingFee(@RequestParam int districtId) {
        GhnShippingFeeResponse feeResponse = ghnLocationService.calculateShippingFee(districtId, 1000);
        
        Map<String, Object> response = new HashMap<>();
        if (feeResponse != null && feeResponse.getTotal() > 0) {
            response.put("shippingFee", feeResponse.getTotal());
        } else {
            response.put("shippingFee", 45000); // Default fee
        }
        
        return ResponseEntity.ok(response);
    }
}
