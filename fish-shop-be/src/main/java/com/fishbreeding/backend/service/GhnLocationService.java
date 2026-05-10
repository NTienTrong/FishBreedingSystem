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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GhnLocationService {

    private final RestTemplate restTemplate;

    @Value("${ghn.token:}")
    private String token;

    @Value("${ghn.shop-id:}")
    private String shopId;

    @Value("${ghn.base-url:}")
    private String baseUrl;

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
}
