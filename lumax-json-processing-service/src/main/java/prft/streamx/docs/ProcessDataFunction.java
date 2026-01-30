package prft.streamx.docs;

import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractAction;
import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractEventTime;
import static dev.streamx.quasar.reactive.messaging.utils.MetadataUtils.extractKey;

import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import prft.streamx.docs.Data;
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
        log.info("Processing message :: " + key);
        Action action = extractAction(message);
        Long eventTime = extractEventTime(message);
        try {
            if (!accept(key, action, eventTime)) {
                log.info("Skipping invalid incoming message");
                log.tracef("Skipping invalid incoming message key=%s", key);
                message.ack();
                return Multi.createFrom().empty();
            }


            String[] parts = key.split(KEY_SEPARATOR);
            if (parts.length < 2) {
                log.warnf("Invalid key format, skipping: %s", key);
                return Multi.createFrom().empty();
            }

            final String id = parts[ID_POSITION];
            final String namespace = parts[NAMESPACE_POSITION];

            // Forward UNPUBLISH as UNPUBLISH (don’t emit a "publish" with empty content)
            if (Action.UNPUBLISH.equals(action)) {
                Message<Data> out = createUnpublishMessage(id, eventTime, namespace);
                return Multi.createFrom().item(out)
                        .onCompletion().call(() -> Uni.createFrom().completionStage(message.ack()));
            }

            final Data payload = message.getPayload();
            String json = payload.getContentAsString();
            log.info("JSON data of product :: " + json);

        }
        catch (Exception e){
            message.nack(e);
            return Multi.createFrom().empty();
        }


        return Multi.createFrom().empty();
    }

    private boolean accept(String key, Action action, Long eventTime) {
        return super.accept(key) && action != null && eventTime != null
                && key.split(KEY_SEPARATOR).length == 2;
    }

}