package prft.streamx.docs.configuration;

import io.smallrye.config.ConfigMapping;

import java.util.List;

@ConfigMapping(prefix = "streamx.blueprints.json-aggregator-processing-service")
public interface AggregatorConfiguration {

  List<Configuration> configurations();
}
