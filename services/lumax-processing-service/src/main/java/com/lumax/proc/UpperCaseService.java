package dev.streamx.docs.sampleprocessingservice;

import dev.streamx.quasar.reactive.messaging.metadata.Action;
import io.smallrye.reactive.messaging.GenericPayload;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import dev.streamx.blueprints.data.Data;
import org.jboss.logging.Logger;
@ApplicationScoped
public class UpperCaseService {

  @Inject
  Logger log;

  @Incoming("incoming-strings")
  @Outgoing("capitalized-strings")
  public GenericPayload<Data> processRequest(Data data, Action action) {
    if (Action.PUBLISH.equals(action)) {
      log.infof("In: %s", new String(data.getContent().array()));
      Data uppercased = new Data(uppercase(new String(data.getContent().array())));
      log.infof("Out: %s", new String(uppercased.getContent().array()));
      return GenericPayload.of(uppercased);
    } else if (Action.UNPUBLISH.equals(action)) {
      return GenericPayload.of(null);
    } else {
      return null;
    }
  }

  private static String uppercase(String inputString) {
    if (inputString == null || inputString.isEmpty()) {
      return inputString;
    }

    return inputString.toUpperCase();
  }
}