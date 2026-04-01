package prft.streamx.docs;

import com.azure.cosmos.CosmosClient;
import com.azure.cosmos.CosmosContainer;
import com.google.gson.*;
import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.reactive.messaging.GenericPayload;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import dev.streamx.blueprints.data.Data;
import org.jboss.logging.Logger;
import prft.streamx.cosmosdb.CosmosClientProvider;

import java.util.Map;

@ApplicationScoped
public class ProcessDataFunction {

    private static final String CHANNEL_AGGREGATED_DATA = "aggregated-data";
    private static final String CHANNEL_CUSTOM_AGGREGATED_DATA = "custom-aggregated-data";

    @Inject
    Logger log;

    @Inject
    CosmosClientProvider cosmosProvider;

    @Incoming(CHANNEL_AGGREGATED_DATA)
    @Outgoing(CHANNEL_CUSTOM_AGGREGATED_DATA)
    public GenericPayload<Data> processRequest(Data data, Action action) {
        if (Action.PUBLISH.equals(action)) {
            String dataString = new String(data.getContent().array());
            log.infof("Inside processRequest ProcessDataFunction");
            JsonObject gsonObj = JsonParser.parseString(dataString).getAsJsonObject();

            JsonElement slugEl = gsonObj.get("slug");
            String slug = (slugEl != null && !slugEl.isJsonNull()) ? slugEl.getAsString() : "";


            JsonArray gsonArray = new JsonArray();
            //Adding View
            JsonObject viewGson = new JsonObject();
            viewGson.addProperty("name", "view1");
            viewGson.addProperty("description", "compare-view");
            viewGson.addProperty("url", "/products/view/"+slug+".html");
            gsonArray.add(viewGson);

            gsonObj.add("views", gsonArray);


            JsonArray attributes = gsonObj.getAsJsonArray("attributes");
            JsonArray aiPayloadArray = new JsonArray();

            for (JsonElement attrElement : attributes) {
                JsonObject attrObj = attrElement.getAsJsonObject();

                if (attrObj.get("name").getAsString().equals("ai_payload")) {

                    // Get the CSV string from values[0].value
                    String csv = attrObj
                            .getAsJsonArray("values")
                            .get(0).getAsJsonObject()
                            .get("value").getAsString();

                    // Split and add into JsonArray
                    for (String s : csv.split("\\s*,\\s*")) {
                        aiPayloadArray.add(s);
                    }
                    break;
                }
            }

            JsonObject dbJson = new JsonObject();
            dbJson.addProperty("id", gsonObj.get("sku").getAsString());
            dbJson.addProperty("productid", gsonObj.get("sku").getAsString());
            dbJson.addProperty("name", gsonObj.get("name").getAsString());
            dbJson.addProperty("description", gsonObj.get("description").getAsString());
            dbJson.addProperty("slug",slug);
            dbJson.add("views", gsonArray);
            dbJson.add("ai_payload", aiPayloadArray);

            log.debugf("CosmosDB JSON : %s", dbJson.toString());

            try {
                CosmosClient client = cosmosProvider.getClient();
                CosmosContainer container = client
                        .getDatabase("lumaxdb")
                        .getContainer("products");
                Map<String, Object> dbMap = new Gson().fromJson(dbJson, Map.class);
                container.upsertItem(dbMap);
                log.infof("Upserted data into CosmosDB : %s", gsonObj.get("sku").getAsString());
            }catch (Exception e) {
                log.error("Error while inserting data into DB. ", e);
            }
            Data updatedData = new Data(gsonObj.toString());
            return GenericPayload.of(updatedData);
        } else if (Action.UNPUBLISH.equals(action)) {
            return GenericPayload.of(null);
        } else {
            return null;
        }
    }
}
