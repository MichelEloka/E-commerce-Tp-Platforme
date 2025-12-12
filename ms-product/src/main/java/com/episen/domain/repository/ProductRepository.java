package com.episen.domain.repository;

import com.episen.domain.entity.Product;
import com.episen.domain.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategory(Category category);

    List<Product> findByStockGreaterThan(Integer stock);

    List<Product> findByStockGreaterThanAndActiveTrue(Integer stock);

    boolean existsByNameIgnoreCase(String name);

    long countByStockLessThan(Integer stock);
}
