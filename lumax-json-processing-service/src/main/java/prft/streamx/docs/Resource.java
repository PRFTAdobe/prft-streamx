package prft.streamx.docs;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.nio.ByteBuffer;
import org.apache.avro.specific.AvroGenerated;

/**
 * Represents object containing content.
 */
@AvroGenerated
public class Resource {

  private ByteBuffer content;

  protected Resource() {
    // needed for Avro serialization
  }

  public Resource(ByteBuffer content) {
    this.content = content;
  }

  public Resource(byte[] content) {
    this(ByteBuffer.wrap(content));
  }

  public Resource(String content) {
    this(content.getBytes(UTF_8));
  }

  public ByteBuffer getContent() {
    return content;
  }

  public String getContentAsString() {
    return new String(content.array(), UTF_8);
  }
}
