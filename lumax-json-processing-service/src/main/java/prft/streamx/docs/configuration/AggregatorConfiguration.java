package prft.streamx.docs.configuration;

import io.smallrye.config.ConfigMapping;

import java.util.List;

@ConfigMapping(prefix = "prft.lumax.json-aggregator-processing-service")
public interface AggregatorConfiguration {

  List<Configuration> configurations();
}
