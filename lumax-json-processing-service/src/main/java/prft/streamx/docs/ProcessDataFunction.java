package prft.streamx.docs;

import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractAction;
import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractEventTime;
import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractKey;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import io.smallrye.mutiny.Multi;
import org.jboss.logging.Logger;
import prft.streamx.docs.configuration.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class ProcessDataFunction extends AbstractFunction {

    private static final String CHANNEL_AGGREGATED_DATA = "aggregated-data";
    private static final String CHANNEL_CUSTOM_AGGREGATED_DATA = "custom-aggregated-data";

    protected final Map<Configuration, Set<String>> supportedNamespacesByConfig
            = new LinkedHashMap<>();

    @Inject
    Logger log;


    @Incoming(CHANNEL_AGGREGATED_DATA)
    @Outgoing(CHANNEL_CUSTOM_AGGREGATED_DATA)
    Multi<Message<Data>> process(Message<Data> message) {
        String key = extractKey(message);
        log.info("Inside ProcessDataFunction");
        Action action = extractAction(message);
        Long eventTime = extractEventTime(message);
        try {
            log.info("Processing message :: " + key + " :: Action :: " + action);

            String[] parts = key.split(KEY_SEPARATOR);
            if (parts.length < 2) {
                log.warnf("Invalid key format, skipping: %s", key);
                return Multi.createFrom().empty();
            }
            final String id = parts[ID_POSITION];
            final String namespace = parts[NAMESPACE_POSITION];

            if (!namespace.equalsIgnoreCase("product")) {
                log.tracef("Not a product, skipping: %s", key);
                return Multi.createFrom().empty();
            }

            // Forward UNPUBLISH as UNPUBLISH (don’t emit a "publish" with empty content)
            if (Action.UNPUBLISH.equals(action)) {
                log.info("Processing Unpublish event");
                Message<Data> out = createUnpublishMessage(id, eventTime, namespace);
                return Multi.createFrom().item(out)
                        .onCompletion().call(() -> Uni.createFrom().completionStage(message.ack()));
            }

            final Data payload = message.getPayload();
            String json = payload.getContentAsString();

            log.info("JSON data of product :: " + json);

            JsonObject gsonObj = JsonParser.parseString(json).getAsJsonObject();


            JsonElement slugEl = gsonObj.get("slug");
            String slug = (slugEl != null && !slugEl.isJsonNull()) ? slugEl.getAsString() : "";


            JsonArray gsonArray = new JsonArray();
            //Adding View1
            JsonObject viewGson = new JsonObject();
            viewGson.addProperty("name", "view1");
            viewGson.addProperty("description", "compare-view");
            viewGson.addProperty("url", "/products/view1/"+slug+".html");
            gsonArray.add(viewGson);

            //Adding View2
            JsonObject view2Gson = new JsonObject();
            view2Gson.addProperty("name", "view2");
            view2Gson.addProperty("description", "tile-view");
            view2Gson.addProperty("url", "/products/view2/"+slug+".html");
            gsonArray.add(view2Gson);
            gsonObj.add("views", gsonArray);
            log.info("GsonObject :: "+gsonObj);
        }
        catch (Exception e){
            message.nack(e);
            return Multi.createFrom().empty();
        }


        return Multi.createFrom().empty();
    }

}