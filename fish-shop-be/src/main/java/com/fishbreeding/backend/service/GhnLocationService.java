package com.fishbreeding.backend.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fishbreeding.backend.dto.ghn.GhnDistrictResponse;
import com.fishbreeding.backend.dto.ghn.GhnProvinceResponse;
import com.fishbreeding.backend.dto.ghn.GhnResponse;
import com.fishbreeding.backend.dto.ghn.GhnWardResponse;
import com.fishbreeding.backend.dto.ghn.GhnShippingFeeRequest;
import com.fishbreeding.backend.dto.ghn.GhnShippingFeeResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class GhnLocationService {

    private final RestTemplate restTemplate;

    private static final Logger log = LoggerFactory.getLogger(GhnLocationService.class);

    @Value("${ghn.token:}")
    private String token;

    @Value("${ghn.shop-id:}")
    private String shopId;

    @Value("${ghn.base-url:}")
    private String baseUrl;

    // --- ĐÃ THÊM CẤU HÌNH ĐỊA CHỈ TRẠI CÁ MẶC ĐỊNH ---
    @Value("${ghn.from-district-id:0}")
    private int fromDistrictId;

    @Value("${ghn.from-ward-code:}")
    private String fromWardCode;

    public List<GhnProvinceResponse> getProvinces() {
        return fetchList("/master-data/province", new ParameterizedTypeReference<GhnResponse<List<GhnProvinceResponse>>>() {});
    }

    public List<GhnDistrictResponse> getDistricts(int provinceId) {
        String path = String.format("/master-data/district?province_id=%d", provinceId);
        return fetchList(path, new ParameterizedTypeReference<GhnResponse<List<GhnDistrictResponse>>>() {});
    }

    public List<GhnWardResponse> getWards(int districtId) {
        String path = String.format("/master-data/ward?district_id=%d", districtId);
        return fetchList(path, new ParameterizedTypeReference<GhnResponse<List<GhnWardResponse>>>() {});
    }

    /**
     * Calculate shipping fee from GHN based on district and weight
     * Default weight: 1000 (grams), default dimensions: 15x15x15 (cm)
     */
    public GhnShippingFeeResponse calculateShippingFee(int districtId, String wardCode, int weightGrams) {
        if (weightGrams <= 0) {
            weightGrams = 1000; // Default 1kg
        }

        // Đã cập nhật: Kiểm tra thêm cả fromWardCode của Shop
        if (fromDistrictId <= 0 || !StringUtils.hasText(fromWardCode) || !StringUtils.hasText(wardCode)) {
            log.warn("GHN fee missing fromDistrictId, fromWardCode or wardCode; fromDistrictId={}, fromWardCodePresent={}, toWardCodePresent={}",
                fromDistrictId, StringUtils.hasText(fromWardCode), StringUtils.hasText(wardCode));
            return null;
        }

        // Đã cập nhật: Truyền fromWardCode vào Request
        GhnShippingFeeRequest request = GhnShippingFeeRequest.builder()
                .fromDistrictId(fromDistrictId)
                .fromWardCode(fromWardCode) // Thêm dòng này để tính phí chính xác từ Thị trấn Lim
                .toDistrictId(districtId)
                .toWardCode(wardCode)
                .weight(weightGrams)
                // GHN API V2 thường yêu cầu thêm service_type_id (2: Giao Chuẩn) để tính phí
                .serviceTypeId(2) 
                .build();

        String path = "/v2/shipping-order/fee";
        return fetchShippingFee(path, request);
    }

    private <T> List<T> fetchList(String path, ParameterizedTypeReference<GhnResponse<List<T>>> type) {
        if (!StringUtils.hasText(baseUrl)) {
            log.warn("GHN base URL is empty; path={}", path);
            return Collections.emptyList();
        }

        String url = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String endpoint = url + path;

        HttpHeaders headers = new HttpHeaders();
        if (StringUtils.hasText(token)) {
            headers.set("Token", token);
        }
        if (StringUtils.hasText(shopId)) {
            headers.set("ShopId", shopId);
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            log.info("Calling GHN API: endpoint={}, hasToken={}, hasShopId={}",
                    endpoint,
                    StringUtils.hasText(token),
                    StringUtils.hasText(shopId));

            ResponseEntity<GhnResponse<List<T>>> response = restTemplate.exchange(endpoint, HttpMethod.GET, entity, type);
            log.info("GHN API response: endpoint={}, status={}", endpoint, response.getStatusCode());

            GhnResponse<List<T>> body = response.getBody();
            if (body == null || body.getData() == null) {
                log.warn("GHN API empty data: endpoint={}, bodyPresent={}", endpoint, body != null);
                return Collections.emptyList();
            }

            return body.getData();
        } catch (RestClientException ex) {
            log.error("GHN API call failed: endpoint={}, message={}", endpoint, ex.getMessage(), ex);
            return Collections.emptyList();
        }
    }

    private GhnShippingFeeResponse fetchShippingFee(String path, GhnShippingFeeRequest request) {
        if (!StringUtils.hasText(baseUrl)) {
            log.warn("GHN base URL is empty; path={}", path);
            return null;
        }

        String url = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String endpoint = url + path;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        if (StringUtils.hasText(token)) {
            headers.set("Token", token);
        }
        if (StringUtils.hasText(shopId)) {
            headers.set("ShopId", shopId);
        }

        HttpEntity<GhnShippingFeeRequest> entity = new HttpEntity<>(request, headers);
        try {
            log.info("Calling GHN shipping fee API: endpoint={}, districtId={}, weight={}",
                    endpoint, request.getToDistrictId(), request.getWeight());

            ResponseEntity<GhnResponse<GhnShippingFeeResponse>> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<GhnResponse<GhnShippingFeeResponse>>() {});

            log.info("GHN shipping fee API response: endpoint={}, status={}", endpoint, response.getStatusCode());

            GhnResponse<GhnShippingFeeResponse> body = response.getBody();
            if (body == null || body.getData() == null) {
                log.warn("GHN shipping fee API empty data: endpoint={}", endpoint);
                return null;
            }

            return body.getData();
        } catch (RestClientException ex) {
            log.error("GHN shipping fee API call failed: endpoint={}, message={}", endpoint, ex.getMessage(), ex);
            return null;
        }
    }
}