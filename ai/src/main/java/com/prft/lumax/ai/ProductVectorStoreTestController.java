package com.prft.lumax.ai;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test")
@Slf4j
public class ProductVectorStoreTestController {

    private final ProductVectorStoreService vectorStoreService;

    public ProductVectorStoreTestController(ProductVectorStoreService vectorStoreService) {
        this.vectorStoreService = vectorStoreService;
    }

    // -------------------------------------------------------
    // 1. Index hardcoded product → calls upsertProduct()
    // GET http://localhost:8080/test/index
    // -------------------------------------------------------
    @GetMapping("/index")
    public ResponseEntity<Map<String, Object>> testIndex() {
        log.info("TEST: Starting hardcoded product indexing...");

        Product product = buildHardcodedProduct();

        long start = System.currentTimeMillis();
        vectorStoreService.upsertProduct(product);
        long timeTaken = System.currentTimeMillis() - start;

        log.info("TEST: Indexing complete in {}ms", timeTaken);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Product indexed into CosmosDB Vector Store",
                "productId", product.getId(),
                "productName", product.getName(),
                "timeTakenMs", timeTaken
        ));
    }

    // -------------------------------------------------------
    // 2. Search with hardcoded query → calls search()
    // GET http://localhost:8080/test/search
    // GET http://localhost:8080/test/search?query=warm hoodie&topK=3
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 3. Delete hardcoded product → calls deleteProduct()
    // GET http://localhost:8080/test/delete
    // -------------------------------------------------------
    @GetMapping("/delete")
    public ResponseEntity<Map<String, Object>> testDelete() {
        String productId = "MH01";
        log.info("TEST: Deleting product with id={}", productId);

        vectorStoreService.deleteProduct(productId);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Product vector deleted",
                "productId", productId
        ));
    }

    // -------------------------------------------------------
    // 4. Full flow: index → search → all in one shot
    // GET http://localhost:8080/test/full-flow
    // -------------------------------------------------------
/*    @GetMapping("/full-flow")
    public ResponseEntity<Map<String, Object>> testFullFlow() {
        log.info("TEST: Running full flow — index then search...");

        // Step 1: Index
        Product product = buildHardcodedProduct();
        vectorStoreService.upsertProduct(product);
        log.info("TEST: Step 1 done — product indexed");

        // Step 2: Small delay to let CosmosDB index the vector
        try { Thread.sleep(2000); } catch (InterruptedException ignored) {}

        // Step 3: Search
        String query = "show me shirts";
        List<Document> results = vectorStoreService.search(query, 5);
        log.info("TEST: Step 2 done — search returned {} results", results.size());

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "indexed", Map.of(
                        "productid", product.getId(),
                        "productName", product.getName()
                ),
                "searchQuery", query,
                "searchResults", results.stream().map(doc -> Map.of(
                        "id", doc.getId(),
                        "content", doc.getFormattedContent(),
                        "metadata", doc.getMetadata(),
                        "score", doc.getScore() != null ? doc.getScore() : "N/A"
                )).toList()
        ));
    }*/

    // -------------------------------------------------------
    // Hardcoded product — your exact sample JSON
    // -------------------------------------------------------
    private Product buildHardcodedProduct() {
        Product product = new Product();
        product.setId("MH02");
        product.setProductid("MH02");
        product.setName("Chaz Kangeroo Hoodie");
        product.setDescription("<p>Ideal Nagpur for cold-weather training or work, the Chaz Kangeroo Hoodie offers warmth and comfort. Machine wash/dry.</p>");
        product.setSlug("chaz-kangeroo-hoodie");
        product.setAiPayload(List.of(
                "Men",
                "Pullover",
                "Heavyweight Fleece",
                "Bonded Seams"
        ));

        Product.View view = new Product.View();
        view.setName("view1");
        view.setDescription("compare-view");
        view.setUrl("/test.html");
        product.setViews(List.of(view));

        return product;
    }
}
