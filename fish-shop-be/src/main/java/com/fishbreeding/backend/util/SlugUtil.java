package com.fishbreeding.backend.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtil {
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITE_SPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        // Thay thế ký tự Đ/đ của tiếng Việt
        String withoutD = input.replace('Đ', 'D').replace('đ', 'd');

        // Bỏ khoảng trắng, thay bằng dấu gạch ngang
        String nowhitespace = WHITE_SPACE.matcher(withoutD).replaceAll("-");

        // Loại bỏ dấu tiếng Việt
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);

        // Bỏ các ký tự đặc biệt
        String slug = NONLATIN.matcher(normalized).replaceAll("");

        // Chuyển thành chữ thường và loại bỏ các dấu gạch ngang liền kề hoặc ở đầu/cuối
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
