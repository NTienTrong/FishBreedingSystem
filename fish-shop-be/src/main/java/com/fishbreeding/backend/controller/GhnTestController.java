package com.fishbreeding.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.ghn.GhnDistrictResponse;
import com.fishbreeding.backend.dto.ghn.GhnProvinceResponse;
import com.fishbreeding.backend.dto.ghn.GhnShippingFeeResponse;
import com.fishbreeding.backend.dto.ghn.GhnWardResponse;
import com.fishbreeding.backend.service.GhnLocationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Test endpoint để xác minh cấu hình GHN
 * Dùng để lấy ProvinceID, DistrictID, WardCode chính xác
 */
@RestController
@RequestMapping("/api/public/ghn-test")
@RequiredArgsConstructor
@Slf4j
public class GhnTestController {

    private final GhnLocationService ghnLocationService;

    /**
     * GET /api/public/ghn-test/provinces
     * Lấy danh sách tỉnh/thành phố
     */
    @GetMapping("/provinces")
    public ResponseEntity<List<GhnProvinceResponse>> getProvinces() {
        log.info("Fetching GHN provinces for verification");
        List<GhnProvinceResponse> provinces = ghnLocationService.getProvinces();
        return ResponseEntity.ok(provinces);
    }

    /**
     * GET /api/public/ghn-test/districts?provinceId=2
     * Lấy danh sách huyện/quận của tỉnh
     * @param provinceId ProvinceID (Bắc Ninh = 2)
     */
    @GetMapping("/districts")
    public ResponseEntity<List<GhnDistrictResponse>> getDistricts(@RequestParam int provinceId) {
        log.info("Fetching GHN districts for provinceId={}", provinceId);
        List<GhnDistrictResponse> districts = ghnLocationService.getDistricts(provinceId);
        return ResponseEntity.ok(districts);
    }

    /**
     * GET /api/public/ghn-test/wards?districtId=205
     * Lấy danh sách phường/xã của huyện
     * @param districtId DistrictID (Tiên Du = 205)
     */
    @GetMapping("/wards")
    public ResponseEntity<List<GhnWardResponse>> getWards(@RequestParam int districtId) {
        log.info("Fetching GHN wards for districtId={}", districtId);
        List<GhnWardResponse> wards = ghnLocationService.getWards(districtId);
        return ResponseEntity.ok(wards);
    }

    /**
     * POST /api/public/ghn-test/shipping-fee
     * Tính phí vận chuyển từ shop đến địa chỉ khách hàng
     * @param toDistrictId DistrictID của khách hàng
     * @param toWardCode WardCode của khách hàng
     * @param weight Cân nặng (grams)
     */
    @PostMapping("/shipping-fee")
    public ResponseEntity<GhnShippingFeeResponse> calculateShippingFee(
            @RequestParam int toDistrictId,
            @RequestParam String toWardCode,
            @RequestParam(defaultValue = "1000") int weight) {
        log.info("Calculating GHN shipping fee - toDistrictId={}, toWardCode={}, weight={}", 
            toDistrictId, toWardCode, weight);
        GhnShippingFeeResponse fee = ghnLocationService.calculateShippingFee(toDistrictId, toWardCode, weight);
        return ResponseEntity.ok(fee);
    }
}
