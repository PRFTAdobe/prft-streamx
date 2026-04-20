package com.prft.lumax.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    private final ProductVectorStoreService vectorStoreService;

    public ProductController(ProductVectorStoreService vectorStoreService) {
        this.vectorStoreService = vectorStoreService;
    }

    // Called on product create or update
    @PostMapping("/index")
    public ResponseEntity<Map<String, String>> indexProduct(@RequestBody Product product) {
        vectorStoreService.upsertProduct(product);
        return ResponseEntity.ok(Map.of(
                "status", "indexed",
                "productId", product.getId(),
                "productName", product.getName()
        ));
    }

    // Called on product delete
    @DeleteMapping("/index/{id}")
    public ResponseEntity<Map<String, String>> removeIndex(@PathVariable String id) {
        vectorStoreService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("status", "removed", "productId", id));
    }

    // Test search endpoint (your N8N webhook will use this pattern)
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> testSearch(
            @RequestParam(defaultValue = "show me hoodies") String query,
            @RequestParam(defaultValue = "5") int topK) {

        long start = System.currentTimeMillis();
        List<Map<String, Object>> results = vectorStoreService.search(query, topK);
        long timeTaken = System.currentTimeMillis() - start;

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "query", query,
                "topK", topK,
                "timeTakenMs", timeTaken,
                "resultsCount", results.size(),
                "results", results
        ));
    }
}