package com.fishbreeding.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SseService {

    private final ObjectMapper objectMapper;

    // topic -> set of emitters
    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String topic) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.computeIfAbsent(topic, t -> ConcurrentHashMap.newKeySet()).add(emitter);

        emitter.onCompletion(() -> emitters.getOrDefault(topic, Set.of()).remove(emitter));
        emitter.onTimeout(() -> emitters.getOrDefault(topic, Set.of()).remove(emitter));
        emitter.onError((e) -> emitters.getOrDefault(topic, Set.of()).remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ignored) {
        }

        return emitter;
    }

    public void emit(String topic, String eventName, Object data) {
        Set<SseEmitter> set = emitters.get(topic);
        if (set == null) return;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(data);
        } catch (Exception ex) {
            payload = String.valueOf(data);
        }

        for (SseEmitter emitter : Set.copyOf(set)) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (Exception ex) {
                set.remove(emitter);
                try { emitter.complete(); } catch (Exception ignore) {}
            }
        }
    }
}
