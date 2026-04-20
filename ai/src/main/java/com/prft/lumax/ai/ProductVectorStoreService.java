package com.prft.lumax.ai;


import com.azure.cosmos.CosmosAsyncClient;
import com.azure.cosmos.models.CosmosQueryRequestOptions;
import com.azure.cosmos.models.PartitionKey;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ProductVectorStoreService {

    private final VectorStore vectorStore;
    private final CosmosAsyncClient cosmosClient;
    private final EmbeddingModel embeddingModel;
    private final ProductEmbeddingTextBuilder textBuilder;

    @Value("${spring.ai.vectorstore.cosmosdb.database-name}")
    private String databaseName;

    @Value("${spring.ai.vectorstore.cosmosdb.container-name}")
    private String containerName;

    public ProductVectorStoreService(VectorStore vectorStore,
                                     CosmosAsyncClient cosmosClient,
                                     EmbeddingModel embeddingModel,
                                     ProductEmbeddingTextBuilder textBuilder) {
        this.vectorStore = vectorStore;
        this.cosmosClient = cosmosClient;
        this.embeddingModel = embeddingModel;
        this.textBuilder = textBuilder;
    }

    public void upsertProduct(Product product) {
        try {
            String embeddingText = textBuilder.build(product);

            // Generate embedding via Gemini
            float[] embeddingArray = embeddingModel.embed(embeddingText);
            log.info("Embedding generated, dimensions: {}", embeddingArray.length);

            ObjectMapper mapper = new ObjectMapper();
            ObjectNode doc = mapper.createObjectNode();

            doc.put("id", product.getId());                  // ← CosmosDB document id
            doc.put("content", embeddingText);               // ← Spring AI expects "content" not "text"

            // Embedding array
            ArrayNode embeddingNode = doc.putArray("embedding");
            for (float f : embeddingArray) {
                embeddingNode.add(f);
            }

            // Metadata
            ObjectNode metadata = doc.putObject("metadata");
            metadata.put("productId", product.getProductid());
            metadata.put("name", product.getName());
            metadata.put("slug", product.getSlug());
            if (product.getAiPayload() != null)
                metadata.put("tags", String.join(", ", product.getAiPayload()));

            // Upsert directly to CosmosDB
            cosmosClient.getDatabase(databaseName)
                    .getContainer(containerName)
                    .upsertItem(doc)
                    .block();

            log.info("Successfully upserted product: {}", product.getId());

        } catch (Exception e) {
            log.error("Failed to upsert product: {}", product.getId(), e);
            throw new RuntimeException("Vector store upsert failed", e);
        }
    }
    public void deleteProduct(String productId) {
        try {
            cosmosClient.getDatabase(databaseName)
                    .getContainer(containerName)
                    .deleteItem(productId, new PartitionKey(productId))
                    .block();
            log.info("Deleted product: {}", productId);
        } catch (Exception e) {
            log.debug("No existing vector for product: {}", productId);
        }
    }

    public List<Map<String, Object>> search(String query, int topK) {
        // Step 1: Embed the query
        float[] queryEmbedding = embeddingModel.embed(query);

        // Step 2: Convert to list for CosmosDB query
        StringBuilder vectorStr = new StringBuilder("[");
        for (int i = 0; i < queryEmbedding.length; i++) {
            vectorStr.append(queryEmbedding[i]);
            if (i < queryEmbedding.length - 1) vectorStr.append(",");
        }
        vectorStr.append("]");

        // Step 3: Run native vector search query
        String sql = String.format(
                "SELECT TOP %d c.id, c.content, c.metadata, " +
                        "VectorDistance(c.embedding, %s) AS score " +
                        "FROM c ORDER BY VectorDistance(c.embedding, %s)",
                topK, vectorStr, vectorStr
        );

        log.info("Executing vector search query for: {}", query);

        CosmosQueryRequestOptions options = new CosmosQueryRequestOptions();

        List<Map<String, Object>> results = new ArrayList<>();

        cosmosClient.getDatabase(databaseName)
                .getContainer(containerName)
                .queryItems(sql, options, Map.class)
                .byPage()
                .blockFirst()
                .getResults()
                .forEach(item -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) item;
                    results.add(map);
                });

        log.info("Vector search returned {} results", results.size());
        return results;
    }

/*    public List<Document> search(String query, int topK) {
        // Search still uses Spring AI VectorStore
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(0.0)
                .build();
        return vectorStore.similaritySearch(request);
    }*/
}