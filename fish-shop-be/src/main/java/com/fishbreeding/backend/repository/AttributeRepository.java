package com.fishbreeding.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.Attribute;


@Repository
public interface  AttributeRepository extends JpaRepository<Attribute, Long>{

    // Tìm kiếm thuộc tính theo tên (phục vụ hiển thị hoặc kiểm tra)
    Optional<Attribute> findByName(String name);

    // Kiểm tra xem tên thuộc tính đã tồn tại chưa (Dùng cho logic Create/Update)
    boolean existsByName(String name);

    // Kiểm tra trùng tên nhưng loại trừ ID hiện tại (Dùng khi Update thuộc tính)
    boolean existsByNameAndIdNot(String name, Long id);
}
