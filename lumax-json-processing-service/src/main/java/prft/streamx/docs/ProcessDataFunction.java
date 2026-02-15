package prft.streamx.docs;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.reactive.messaging.GenericPayload;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import dev.streamx.blueprints.data.Data;
import org.jboss.logging.Logger;

@ApplicationScoped
public class ProcessDataFunction {

    private static final String CHANNEL_AGGREGATED_DATA = "aggregated-data";
    private static final String CHANNEL_CUSTOM_AGGREGATED_DATA = "custom-aggregated-data";

    @Inject
    Logger log;


    @Incoming(CHANNEL_AGGREGATED_DATA)
    @Outgoing(CHANNEL_CUSTOM_AGGREGATED_DATA)
    public GenericPayload<Data> processRequest(Data data, Action action) {
        if (Action.PUBLISH.equals(action)) {
            String dataString = new String(data.getContent().array());
            log.infof("In: %s", dataString);
            JsonObject gsonObj = JsonParser.parseString(dataString).getAsJsonObject();

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

            Data updatedData = new Data(gsonObj.toString());
            log.infof("Out: %s", new String(updatedData.getContent().array()));
            return GenericPayload.of(updatedData);
        } else if (Action.UNPUBLISH.equals(action)) {
            return GenericPayload.of(null);
        } else {
            return null;
        }
    }
}