package prft.streamx.cosmosdb;

import com.azure.cosmos.ConsistencyLevel;
import com.azure.cosmos.CosmosClient;
import com.azure.cosmos.CosmosClientBuilder;
import jakarta.inject.Singleton;

@Singleton
public class CosmosClientProvider {

    private final CosmosClient client;


    public CosmosClientProvider() {
        this.client = new CosmosClientBuilder()
                .endpoint("https://lumax.documents.azure.com:443")
                .key("key==")
                .consistencyLevel(ConsistencyLevel.EVENTUAL)
                .buildClient();
    }

    public CosmosClient getClient() { return client; }

}
