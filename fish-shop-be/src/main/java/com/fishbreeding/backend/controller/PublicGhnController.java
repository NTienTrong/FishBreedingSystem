package com.fishbreeding.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.ghn.GhnDistrictResponse;
import com.fishbreeding.backend.dto.ghn.GhnProvinceResponse;
import com.fishbreeding.backend.dto.ghn.GhnWardResponse;
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
}
