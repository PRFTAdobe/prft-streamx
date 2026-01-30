package prft.streamx.docs;

import java.nio.ByteBuffer;
import org.apache.avro.specific.AvroGenerated;

/**
 * Represents data object.
 */
@AvroGenerated
public class Data extends Resource {

  protected Data() {
    // needed for Avro serialization
  }

  public Data(ByteBuffer content) {
    super(content);
  }

  public Data(byte[] content) {
    super(content);
  }

  public Data(String content) {
    super(content);
  }

}
