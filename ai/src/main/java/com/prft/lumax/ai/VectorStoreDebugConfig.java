package com.prft.lumax.ai;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class VectorStoreDebugConfig {

    @Value("${spring.ai.vectorstore.cosmosdb.database-name}")
    private String databaseName;

    @Value("${spring.ai.vectorstore.cosmosdb.container-name}")
    private String containerName;

    @Value("${spring.ai.vectorstore.cosmosdb.endpoint}")
    private String endpoint;

    @Value("${spring.ai.vectorstore.cosmosdb.vector-dimensions}")
    private int dimensions;

    @PostConstruct
    public void printConfig() {
        log.info("====== COSMOSDB VECTOR STORE CONFIG ======");
        log.info("Endpoint:   {}", endpoint);
        log.info("Database:   {}", databaseName);
        log.info("Container:  {}", containerName);
        log.info("Dimensions: {}", dimensions);
        log.info("==========================================");
    }
}