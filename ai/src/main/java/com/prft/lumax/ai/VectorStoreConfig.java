package com.prft.lumax.ai;

import com.azure.cosmos.CosmosAsyncClient;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.cosmosdb.CosmosDBVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(final CosmosAsyncClient cosmosClient,
                                   final EmbeddingModel embeddingModel,
                                   final ObservationRegistry observationRegistry) {
        return CosmosDBVectorStore.builder(cosmosClient, embeddingModel)
                .databaseName("lumaxdb")
                .containerName("productstest")
                .partitionKeyPath("/id")
                .vectorDimensions(3072)
                .metadataFields(List.of("productId", "name", "slug", "tags")) // ← declare fields
                .observationRegistry(observationRegistry)
                .build();
    }
}