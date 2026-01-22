package org.prft.deliveryservice;

import dev.streamx.quasar.reactive.messaging.metadata.Action;
import dev.streamx.quasar.reactive.messaging.metadata.Key;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;

@ApplicationScoped
public class DeliverStringsService {

    @Inject
    StringsRepository stringsRepository;


    @Incoming("strings")
    public void handleIncomingString(StringWrapper incomingString, Key key, Action action) {
        if (action.equals(Action.PUBLISH)) {
            stringsRepository.put(key.getValue(), incomingString.getValue());
        } else if (action.equals(Action.UNPUBLISH)) {
            stringsRepository.remove(key.getValue());
        }


    }
}