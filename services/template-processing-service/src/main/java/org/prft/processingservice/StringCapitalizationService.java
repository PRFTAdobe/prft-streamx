package org.prft.processingservice;

import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.reactive.messaging.GenericPayload;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.util.logging.Logger;

@ApplicationScoped
public class StringCapitalizationService {


    @Incoming("incoming-strings")
    @Outgoing("capitalized-strings")
    public GenericPayload<StringWrapper> processRequest(StringWrapper incomingString, Action action) {
        System.out.println("Received message: " + incomingString);
        if (Action.PUBLISH.equals(action)) {
            StringWrapper capitalized = new StringWrapper(capitalize(incomingString.getValue()));
            return GenericPayload.of(capitalized);
        } else if (Action.UNPUBLISH.equals(action)) {
            return GenericPayload.of(null);
        } else {
            return null;
        }
    }

    private static String capitalize(String inputString) {
        if (inputString == null || inputString.isEmpty()) {
            return inputString;
        }
        char firstLetter = Character.toUpperCase(inputString.charAt(0));
        return firstLetter + inputString.substring(1);
    }
}
